require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const { startScheduler } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Test sayfası
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`\n🚀 Daily Verb Flow sunucusu çalışıyor!`);
    console.log(`📍 http://localhost:${PORT}\n`);

    // Scheduler'ı başlat (Firebase yapılandırılmışsa)
    if (process.env.FIREBASE_PROJECT_ID) {
        startScheduler();
    } else {
        console.log('⚠️  Firebase yapılandırılmamış — scheduler devre dışı.');
        console.log('   .env dosyasına Firebase bilgilerini ekleyin.\n');
    }
});

module.exports = app;
