const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { sendDailyEmails } = require('../services/scheduler');

// Firebase yoksa bilgilendir
function requireFirebase(req, res) {
    if (!db) {
        res.status(503).json({
            error: 'Firebase yapılandırılmamış. .env dosyasına Firebase bilgilerini ekleyin.',
            demo: true
        });
        return false;
    }
    return true;
}

// ============================================
// POST /api/register — Kullanıcı kaydı
// ============================================
router.post('/register', async (req, res) => {
    if (!requireFirebase(req, res)) return;
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Ad ve e-posta zorunludur.' });
        }

        // E-posta zaten kayıtlı mı kontrol et
        const existing = await db
            .collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (!existing.empty) {
            return res.status(409).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        // Yeni kullanıcı oluştur
        const userRef = await db.collection('users').add({
            name,
            email,
            level: null, // Test sonrası atanacak
            startDate: new Date(),
            lastSentIndex: 0,
            isActive: true,
        });

        res.status(201).json({
            success: true,
            userId: userRef.id,
            message: 'Kayıt başarılı! Şimdi seviye testine yönlendiriliyorsunuz.',
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu.' });
    }
});

// ============================================
// POST /api/submit-test — Seviye testi sonucu
// ============================================
router.post('/submit-test', async (req, res) => {
    if (!requireFirebase(req, res)) return;
    try {
        const { userId, score, totalQuestions } = req.body;

        if (!userId || score === undefined || !totalQuestions) {
            return res.status(400).json({ error: 'Eksik veri.' });
        }

        // Skora göre seviye belirle
        const percentage = (score / totalQuestions) * 100;
        let level;

        if (percentage <= 20) {
            level = 'A1';
        } else if (percentage <= 40) {
            level = 'A2';
        } else if (percentage <= 60) {
            level = 'B1';
        } else if (percentage <= 80) {
            level = 'B2';
        } else {
            level = 'C1';
        }

        // Kullanıcı seviyesini güncelle
        await db.collection('users').doc(userId).update({
            level,
            testScore: score,
            testCompletedAt: new Date(),
        });

        res.json({
            success: true,
            level,
            score,
            percentage: Math.round(percentage),
            message: `Seviyeniz ${level} olarak belirlendi!`,
        });
    } catch (error) {
        console.error('Submit test error:', error);
        res.status(500).json({ error: 'Test sonucu kaydedilirken hata oluştu.' });
    }
});

// ============================================
// GET /api/unsubscribe/:userId — Abonelikten çık
// ============================================
router.get('/unsubscribe/:userId', async (req, res) => {
    if (!requireFirebase(req, res)) return;
    try {
        const { userId } = req.params;

        await db.collection('users').doc(userId).update({
            isActive: false,
            unsubscribedAt: new Date(),
        });

        res.send(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Abonelik İptal Edildi</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: #1e293b;
          }
          .card {
            background: white;
            padding: 48px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            max-width: 420px;
          }
          .card .icon { font-size: 48px; margin-bottom: 16px; }
          .card h2 { font-size: 22px; margin-bottom: 8px; }
          .card p { color: #64748b; font-size: 15px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">👋</div>
          <h2>Aboneliğiniz İptal Edildi</h2>
          <p>Artık Daily Verb Flow e-postaları almayacaksınız. Bizi tercih ettiğiniz için teşekkürler!</p>
        </div>
      </body>
      </html>
    `);
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).send('Abonelik iptal edilirken bir hata oluştu.');
    }
});

// ============================================
// POST /api/send-daily — Manuel test tetiklemesi
// ============================================
router.post('/send-daily', async (req, res) => {
    if (!requireFirebase(req, res)) return;
    try {
        await sendDailyEmails();
        res.json({ success: true, message: 'Günlük mailler gönderildi.' });
    } catch (error) {
        console.error('Send daily error:', error);
        res.status(500).json({ error: 'Mail gönderimi sırasında hata oluştu.' });
    }
});

module.exports = router;
