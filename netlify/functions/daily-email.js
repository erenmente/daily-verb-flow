/**
 * Netlify Scheduled Function — Günlük Fiil E-postası
 * 
 * Her gün Türkiye saatiyle 08:00'de tetiklenir (UTC 05:00).
 * Firestore'dan aktif kullanıcıları okur, seviyelerine uygun
 * 10 fiil seçer ve SendGrid ile kişiselleştirilmiş mail gönderir.
 * 
 * Netlify 10s timeout limitine uyum için batch yapısı kullanır.
 */
const { schedule } = require('@netlify/functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

// ===================================
// FIREBASE INIT
// ===================================
let db = null;
try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey && !admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        });
        db = admin.firestore();
    }
} catch (e) {
    console.error('Firebase init error:', e.message);
}

// ===================================
// SENDGRID INIT
// ===================================
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// ===================================
// BATCH SIZE — Netlify 10s timeout'a uyum
// ===================================
const BATCH_SIZE = 5;  // Aynı anda max 5 kullanıcıya mail gönder
const VERBS_PER_USER = 10;

// ===================================
// KULLANICIYA UYGUN FİİLLERİ SEÇ
// ===================================
async function getVerbsForUser(level, lastSentIndex) {
    const snapshot = await db.collection('vocabulary')
        .where('level', '==', level)
        .orderBy('createdAt', 'asc')
        .offset(lastSentIndex)
        .limit(VERBS_PER_USER)
        .get();

    const verbs = [];
    snapshot.forEach((doc) => verbs.push({ id: doc.id, ...doc.data() }));

    // Yetersiz fiil varsa ve sıfırdan döngüye başla
    if (verbs.length < VERBS_PER_USER && lastSentIndex > 0) {
        const moreSnapshot = await db.collection('vocabulary')
            .where('level', '==', level)
            .orderBy('createdAt', 'asc')
            .limit(VERBS_PER_USER - verbs.length)
            .get();
        moreSnapshot.forEach((doc) => verbs.push({ id: doc.id, ...doc.data() }));
    }

    return verbs;
}

// ===================================
// HTML E-POSTA OLUŞTUR
// ===================================
function buildEmailHTML(userName, verbs, userId) {
    const baseUrl = process.env.URL || process.env.BASE_URL || 'https://your-site.netlify.app';
    const unsubscribeUrl = `${baseUrl}/api/unsubscribe/${userId}`;

    const verbRows = verbs.map((verb, i) => `
    <tr>
      <td style="padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#667eea22,#764ba222);border-radius:12px;margin:12px 0;">
          <tr>
            <td style="padding:20px 24px;">
              <div style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Fiil #${i + 1}</div>
              <div style="font-size:22px;font-weight:700;color:#1e293b;margin-bottom:4px;">${verb.v1} → ${verb.v2} → ${verb.v3}</div>
              <div style="font-size:15px;color:#6366f1;font-weight:600;">🇹🇷 ${verb.meaning}</div>
            </td>
          </tr>
          ${(verb.exampleSentences || []).map((s, si) => `
          <tr>
            <td style="padding:4px 24px ${si === (verb.exampleSentences.length - 1) ? '20px' : '4px'} 24px;">
              <div style="background:#fff;border-radius:8px;padding:12px 16px;border-left:3px solid ${si === 0 ? '#6366f1' : si === 1 ? '#8b5cf6' : '#a78bfa'};">
                <div style="font-size:14px;color:#1e293b;margin-bottom:4px;">🇬🇧 ${s.en}</div>
                <div style="font-size:13px;color:#64748b;">🇹🇷 ${s.tr}</div>
              </div>
            </td>
          </tr>`).join('')}
        </table>
      </td>
    </tr>`).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
<tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa);padding:40px 32px;text-align:center;">
  <div style="font-size:36px;margin-bottom:8px;">📚</div>
  <h1 style="color:#fff;font-size:26px;margin:0 0 8px;font-weight:700;">Daily Verb Flow</h1>
  <p style="color:rgba(255,255,255,.85);font-size:15px;margin:0;">Günlük Fiil Akışın Hazır!</p>
</td></tr>
<tr><td style="padding:32px 32px 8px;">
  <p style="font-size:16px;color:#334155;margin:0;">Merhaba <strong>${userName}</strong> 👋</p>
  <p style="font-size:14px;color:#64748b;margin:8px 0 0;">İşte bugünkü ${verbs.length} fiilin!</p>
</td></tr>
<tr><td style="padding:8px 24px 24px;"><table width="100%" cellpadding="0" cellspacing="0">${verbRows}</table></td></tr>
<tr><td style="padding:24px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;">Daily Verb Flow aboneliğiniz kapsamında aldınız.</p>
  <a href="${unsubscribeUrl}" style="display:inline-block;padding:10px 24px;background:#fee2e2;color:#dc2626;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">❌ Abonelikten Çık</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

// ===================================
// TEK KULLANICIYA MAİL GÖNDER
// ===================================
async function sendToUser(userDoc) {
    const user = userDoc.data();
    const userId = userDoc.id;

    if (!user.level) {
        console.log(`⏭️ ${user.email} — seviye atanmamış, atlanıyor.`);
        return { email: user.email, status: 'skipped', reason: 'no level' };
    }

    try {
        const verbs = await getVerbsForUser(user.level, user.lastSentIndex || 0);

        if (verbs.length === 0) {
            console.log(`⏭️ ${user.email} — fiil bulunamadı.`);
            return { email: user.email, status: 'skipped', reason: 'no verbs' };
        }

        const html = buildEmailHTML(user.name, verbs, userId);

        await sgMail.send({
            to: user.email,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL || 'noreply@dailyverbflow.com',
                name: process.env.SENDGRID_FROM_NAME || 'Daily Verb Flow',
            },
            subject: `📚 Günlük Fiillerin Hazır, ${user.name}!`,
            html,
        });

        // lastSentIndex güncelle
        await db.collection('users').doc(userId).update({
            lastSentIndex: (user.lastSentIndex || 0) + verbs.length,
            lastEmailSentAt: new Date(),
        });

        console.log(`✅ ${user.email} — mail gönderildi (${verbs.length} fiil)`);
        return { email: user.email, status: 'sent', verbCount: verbs.length };
    } catch (error) {
        console.error(`❌ ${user.email} — hata:`, error.message);
        return { email: user.email, status: 'error', error: error.message };
    }
}

// ===================================
// ANA HANDLER — Batch Mail Gönderimi
// ===================================
const handler = async (event) => {
    const startTime = Date.now();
    console.log(`\n⏰ [${new Date().toISOString()}] Günlük mail scheduled function tetiklendi`);

    if (!db) {
        console.error('❌ Firebase yapılandırılmamış!');
        return { statusCode: 500, body: 'Firebase not configured' };
    }

    if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ SendGrid API key eksik!');
        return { statusCode: 500, body: 'SendGrid not configured' };
    }

    try {
        // Aktif kullanıcıları çek
        const snapshot = await db.collection('users')
            .where('isActive', '==', true)
            .get();

        if (snapshot.empty) {
            console.log('ℹ️ Aktif kullanıcı yok.');
            return { statusCode: 200, body: JSON.stringify({ message: 'No active users', sent: 0 }) };
        }

        const users = snapshot.docs;
        console.log(`📋 ${users.length} aktif kullanıcı bulundu.`);

        const results = [];
        let sentCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        // BATCH GÖNDERİM — 10s timeout'a uyum
        // Her batch'te BATCH_SIZE kullanıcıya paralel gönderim
        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            // Timeout kontrolü — 8s kala dur (güvenlik payı)
            const elapsed = Date.now() - startTime;
            if (elapsed > 8000) {
                console.warn(`⚠️ Timeout riski! ${i}/${users.length} kullanıcı işlendi, kalan atlanıyor.`);
                skippedCount += users.length - i;
                break;
            }

            const batch = users.slice(i, i + BATCH_SIZE);
            console.log(`📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} kullanıcı işleniyor...`);

            // Paralel gönderim
            const batchResults = await Promise.allSettled(
                batch.map((userDoc) => sendToUser(userDoc))
            );

            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                    if (result.value.status === 'sent') sentCount++;
                    else if (result.value.status === 'error') errorCount++;
                    else skippedCount++;
                } else {
                    errorCount++;
                    results.push({ status: 'error', error: result.reason?.message });
                }
            }
        }

        const elapsed = Date.now() - startTime;
        const summary = {
            timestamp: new Date().toISOString(),
            totalUsers: users.length,
            sent: sentCount,
            errors: errorCount,
            skipped: skippedCount,
            executionMs: elapsed,
        };

        console.log('\n📊 SONUÇ:', JSON.stringify(summary, null, 2));

        // Log'u Firestore'a kaydet
        try {
            await db.collection('email_logs').add({
                ...summary,
                details: results,
                createdAt: new Date(),
            });
        } catch (logErr) {
            console.warn('Log kayıt hatası:', logErr.message);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(summary),
        };
    } catch (error) {
        console.error('❌ Scheduled function hatası:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

// ===================================
// NETLIFY SCHEDULED FUNCTION
// Her gün UTC 05:00 = Türkiye 08:00
// ===================================
module.exports.handler = schedule('0 5 * * *', handler);
