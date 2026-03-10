/**
 * Netlify Serverless Function — API Endpoints
 * Express uygulamasını serverless-http ile sarmalayarak
 * tüm /api/* isteklerini karşılar.
 */
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

// --- Firebase Config (inline — Netlify env vars) ---
const admin = require('firebase-admin');
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
    console.warn('Firebase init error:', e.message);
}

// --- Express App ---
const app = express();
app.use(cors());
app.use(express.json());

// Firebase kontrolü
function requireFirebase(req, res) {
    if (!db) {
        res.status(503).json({ error: 'Sistem şu anda geçici olarak hizmet veremiyor. Lütfen daha sonra tekrar deneyin.' });
        return false;
    }
    return true;
}

// POST /api/register
app.post('/api/register', async (req, res) => {
    if (!requireFirebase(req, res)) return;
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Ad ve e-posta zorunludur.' });

        const existing = await db.collection('users').where('email', '==', email).limit(1).get();
        if (!existing.empty) return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı.' });

        const userRef = await db.collection('users').add({
            name, email, level: null, startDate: new Date(), lastSentIndex: 0, isActive: true,
            totalWordsMemorized: 0, wordsSentThisWeek: [], reviewQueue: []
        });

        res.status(201).json({ success: true, userId: userRef.id, message: 'Kayıt başarılı!' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Kayıt sırasında hata oluştu.' });
    }
});

// POST /api/submit-test
app.post('/api/submit-test', async (req, res) => {
    if (!requireFirebase(req, res)) return;
    try {
        const { userId, score, totalQuestions } = req.body;
        if (!userId || score === undefined || !totalQuestions) return res.status(400).json({ error: 'Eksik veri.' });

        const percentage = (score / totalQuestions) * 100;
        let level;
        if (percentage <= 20) level = 'A1';
        else if (percentage <= 40) level = 'A2';
        else if (percentage <= 60) level = 'B1';
        else if (percentage <= 80) level = 'B2';
        else level = 'C1';

        await db.collection('users').doc(userId).update({ level, testScore: score, testCompletedAt: new Date() });
        res.json({ success: true, level, score, percentage: Math.round(percentage), message: `Seviyeniz: ${level}` });
    } catch (error) {
        console.error('Submit test error:', error);
        res.status(500).json({ error: 'Test sonucu kaydedilirken hata oluştu.' });
    }
});

// GET /api/unsubscribe/:userId
app.get('/api/unsubscribe/:userId', async (req, res) => {
    if (!requireFirebase(req, res)) return;
    try {
        await db.collection('users').doc(req.params.userId).update({ isActive: false, unsubscribedAt: new Date() });
        res.send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Abonelik İptal</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#667eea,#764ba2);color:#1e293b}.card{background:#fff;padding:48px;border-radius:20px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.15);max-width:420px}.icon{font-size:48px;margin-bottom:16px}h2{font-size:22px;margin-bottom:8px}p{color:#64748b;font-size:15px;line-height:1.6}</style></head><body><div class="card"><div class="icon">👋</div><h2>Aboneliğiniz İptal Edildi</h2><p>Artık Daily Verb Flow e-postaları almayacaksınız. Teşekkürler!</p></div></body></html>`);
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).send('Hata oluştu.');
    }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
    if (!requireFirebase(req, res)) return;
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'E-posta zorunludur.' });

        const existing = await db.collection('users').where('email', '==', email).limit(1).get();
        if (existing.empty) return res.status(404).json({ error: 'Bu e-posta adresi ile kayıt bulunamadı.' });

        const userDoc = existing.docs[0];
        res.json({ success: true, userId: userDoc.id, name: userDoc.data().name });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Giriş sırasında hata oluştu.' });
    }
});

// GET /api/dashboard/:userId
app.get('/api/dashboard/:userId', async (req, res) => {
    if (!requireFirebase(req, res)) return;
    try {
        const doc = await db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

        const data = doc.data();
        res.json({
            success: true,
            user: {
                name: data.name,
                level: data.level,
                totalWordsMemorized: data.totalWordsMemorized || 0,
                wordsSentThisWeekCount: (data.wordsSentThisWeek || []).length,
                reviewQueueCount: (data.reviewQueue || []).length,
                isActive: data.isActive
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Bilgiler alınırken hata oluştu.' });
    }
});

// GET /api/quiz/:userId
app.get('/api/quiz/:userId', async (req, res) => {
    if (!requireFirebase(req, res)) return;
    try {
        const doc = await db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

        const data = doc.data();
        const words = data.wordsSentThisWeek || [];

        if (words.length < 4) return res.json({ success: true, questions: [], message: 'Sınav oluşturmak için haftalık en az 4 kelimeniz birikmiş olmalı.' });

        const questions = words.map(word => {
            let wrongOptions = words.filter(w => w.v1 !== word.v1).map(w => w.meaning);
            wrongOptions = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 3);

            // Eğer kelime sayısı azsa eksik şıkları uydurma kelimelerle doldurabiliriz ama 4 kelime kontrolü sayesinde gerek yok.
            const options = [...wrongOptions, word.meaning].sort(() => 0.5 - Math.random());

            return {
                id: word.v1,
                verb: word.v1,
                correct_v2: word.v2,
                correct_v3: word.v3,
                correctOption: word.meaning,
                options: options
            };
        });

        res.json({ success: true, questions });
    } catch (error) {
        console.error('Quiz error:', error);
        res.status(500).json({ error: 'Sınav oluşturulurken hata oluştu.' });
    }
});

// POST /api/submit-quiz
app.post('/api/submit-quiz', async (req, res) => {
    if (!requireFirebase(req, res)) return;
    try {
        const { userId, correctIds, incorrectIds } = req.body;
        if (!userId || !Array.isArray(correctIds) || !Array.isArray(incorrectIds)) {
            return res.status(400).json({ error: 'Geçersiz veri biçimi.' });
        }

        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        if (!doc.exists) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

        const data = doc.data();
        const currentTotal = data.totalWordsMemorized || 0;
        const currentQueue = data.reviewQueue || [];
        const wordsThisWeek = data.wordsSentThisWeek || [];

        // Yeni yanlış yapılanları tespit edip reviewQueue'e ekle
        const newReviewItems = wordsThisWeek.filter(w => incorrectIds.includes(w.v1));
        const mergedQueue = [...currentQueue];

        for (const item of newReviewItems) {
            if (!mergedQueue.find(q => q.v1 === item.v1)) {
                mergedQueue.push(item);
            }
        }

        await userRef.update({
            totalWordsMemorized: currentTotal + correctIds.length,
            reviewQueue: mergedQueue,
            wordsSentThisWeek: [] // Sınav bitince haftalık veriyi sıfırla
        });

        res.json({ success: true, message: 'Sonuçlar başarıyla kaydedildi!' });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ error: 'Sınav sonucu kaydedilemedi.' });
    }
});

// Export
module.exports.handler = serverless(app);
