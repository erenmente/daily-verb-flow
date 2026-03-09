const cron = require('node-cron');
const { db } = require('../config/firebase');
const { sendDailyEmail } = require('./emailService');
const { generateVerbs } = require('./openaiService');

/**
 * Kullanıcının seviyesine uygun, daha önce gönderilmemiş 10 fiil seçer
 */
async function getVerbsForUser(level, lastSentIndex) {
    const verbsRef = db.collection('vocabulary');
    const snapshot = await verbsRef
        .where('level', '==', level)
        .orderBy('createdAt', 'asc')
        .offset(lastSentIndex)
        .limit(10)
        .get();

    let verbs = [];
    snapshot.forEach((doc) => verbs.push({ id: doc.id, ...doc.data() }));

    // Yeterli fiil yoksa OpenAI ile üret
    if (verbs.length < 10) {
        console.log(`⚠️ ${level} seviyesinde yeterli fiil yok. OpenAI ile üretiliyor...`);
        const newVerbs = await generateVerbs(level, 10 - verbs.length);

        for (const verb of newVerbs) {
            verb.createdAt = new Date();
            const docRef = await verbsRef.add(verb);
            verbs.push({ id: docRef.id, ...verb });
        }
    }

    return verbs;
}

/**
 * Tüm aktif kullanıcılara günlük mail gönderir
 */
async function sendDailyEmails() {
    console.log('🚀 Günlük mail gönderimi başlıyor...');

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('isActive', '==', true).get();

    if (snapshot.empty) {
        console.log('ℹ️ Aktif kullanıcı bulunamadı.');
        return;
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const doc of snapshot.docs) {
        const user = doc.data();
        const userId = doc.id;

        try {
            const verbs = await getVerbsForUser(user.level, user.lastSentIndex || 0);

            if (verbs.length === 0) {
                console.log(`⚠️ ${user.email} için gönderilecek fiil bulunamadı.`);
                continue;
            }

            const success = await sendDailyEmail(user.email, user.name, verbs, userId);

            if (success) {
                // lastSentIndex güncelle
                await usersRef.doc(userId).update({
                    lastSentIndex: (user.lastSentIndex || 0) + verbs.length,
                });
                sentCount++;
            } else {
                errorCount++;
            }
        } catch (error) {
            console.error(`❌ ${user.email} için hata:`, error.message);
            errorCount++;
        }
    }

    console.log(`✅ Günlük mail gönderimi tamamlandı: ${sentCount} başarılı, ${errorCount} hata`);
}

/**
 * Cron job'u başlatır — Her gün Türkiye saatiyle 08:00
 */
function startScheduler() {
    // '0 8 * * *' = Her gün saat 08:00
    // timezone: Europe/Istanbul (UTC+3)
    cron.schedule(
        '0 8 * * *',
        async () => {
            console.log(`⏰ [${new Date().toISOString()}] Zamanlı görev tetiklendi`);
            await sendDailyEmails();
        },
        {
            timezone: 'Europe/Istanbul',
        }
    );

    console.log('⏰ Scheduler başlatıldı — Her gün 08:00 (Istanbul)');
}

module.exports = { startScheduler, sendDailyEmails, getVerbsForUser };
