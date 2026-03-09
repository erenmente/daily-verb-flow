require('dotenv').config();
const admin = require('firebase-admin');

let db = null;

// Firebase Admin SDK — .env'den oku
try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    }
    db = admin.firestore();
    console.log('✅ Firebase bağlantısı kuruldu.');
  } else {
    console.warn('⚠️  Firebase credentials eksik — .env dosyasını kontrol edin.');
    console.warn('   Uygulama frontend modunda çalışacak (API\'ler devre dışı).\n');
  }
} catch (error) {
  console.warn('⚠️  Firebase başlatılamadı:', error.message);
  console.warn('   Uygulama frontend modunda çalışacak.\n');
}

module.exports = { admin, db };
