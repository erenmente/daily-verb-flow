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
        res.status(503).json({ error: 'Firebase yapılandırılmamış.' });
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

// Export
module.exports.handler = serverless(app);
