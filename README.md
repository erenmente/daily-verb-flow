# Daily Verb Flow 🚀

Daily Verb Flow, kullanıcıların İngilizce kelime dağarcığını geliştirmelerine yardımcı olmak için tasarlanmış otomatik ve sunucusuz (serverless) bir web uygulamasıdır. Seviye tespit sınavı ile kullanıcının İngilizce seviyesini belirler ve haftanın her günü (Türkiye saati ile 08:00'de) kullanıcının e-posta adresine 10 yeni İngilizce fiil (V1, V2, V3 formları) ve örnek cümleler içeren kişiselleştirilmiş mail kampanyaları gönderir.

![Daily Verb Flow](public/images/favicon.svg)

## 🌟 Özellikler

- **Modern & Responsive Tasarım**: Etkileyici bir kullanıcı deneyimi için Glassmorphism (cam efekti) estetiği.
- **Adaptif Seviye Testi**: Kullanıcının CEFR seviyesini (A1'den C1'e) doğru bir şekilde belirleyebilmek için, verilen cevaplara göre zorluğu değişen 15 soruluk dinamik bir sınav.
- **Otomatik Günlük E-postalar**: Her sabah kullanıcıların e-posta kutusuna özelleştirilmiş kelime listeleri göndermek için çalışan zamanlanmış görevler (Cron job).
- **Yapay Zeka Destekli İçerik**: Veritabanındaki kelime stoğu azaldığında, manuel müdahaleye gerek kalmadan Google Gemini 2.0 Flash kullanarak fiiller için yepyeni örnek cümleler üreten akıllı sistem.
- **Akıllı Önbellekleme (Caching)**: Yapay zeka ile üretilen tüm içerikler gelecekteki kullanımlar için veritabanında önbelleğe alınır, bu sayede API maliyetleri büyük ölçüde düşürülür ve performans artar.
- **Güçlü Hata Yönetimi & Toplu İşlem (Batch Processing)**: Sunucusuz mimarinin zaman aşımı (timeout) limitlerini aşabilmek için e-posta gönderimlerini gruplar halinde (batch) işleyecek şekilde tasarlanmıştır.

## 🛠️ Teknoloji Yığını

- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Ağır framework'ler yok, saf performans)
- **Backend**: Node.js, Express.js (Netlify için `serverless-http` ile sarmalanmıştır)
- **Veritabanı**: Firebase Firestore (Kullanıcı profilleri, kelime listeleri ve e-posta logları için NoSQL)
- **E-posta Dağıtımı**: SendGrid API
- **Yapay Zeka Motoru**: Google Gemini API (`@google/generative-ai`)
- **Barındırma & Zamanlama**: Netlify Functions (Serverless & Scheduled Functions)
- **Versiyon Kontrolü**: Git & GitHub

## 📂 Proje Yapısı

```text
├── netlify/               # Netlify konfigürasyonu ve Sunucusuz (Serverless) Fonksiyonlar
│   └── functions/
│       ├── api.js         # Backend API rotaları (Kayıt, Sınav Sonucu İşleme, Abonelik İptali)
│       └── daily-email.js # Günlük e-posta gönderiminden sorumlu zamanlanmış (Cron) fonksiyon
├── public/                # Frontend statik dosyaları
│   ├── css/               # Stil dosyaları (style.css, test.css)
│   ├── js/                # İstemci taraflı scriptler (app.js, test.js)
│   ├── index.html         # Karşılama/Kayıt Sayfası
│   └── test.html          # Adaptif Seviye Belirleme Sınavı Sayfası
├── seeds/                 # Başlangıç kelime veritabanı için yükleme scriptleri (Seed data)
├── package.json           # Bağımlılıklar (Dependencies) ve NPM komutları
├── netlify.toml           # Netlify Derleme (Build) ve Yönlendirme Konfigürasyonu
└── server.js              # Yerel (Local) Express geliştirme sunucusu
```

## 🚀 Yerel Geliştirme (Local Development) Ortamı

Projeyi kendi bilgisayarınızda çalıştırmak için bu adımları izleyin.

### Gereksinimler

- Node.js (v18 veya daha güncel bir sürüm önerilir)
- Bir Firebase Projesi (Firestore etkinleştirilmiş şekilde)
- Bir SendGrid Hesabı (Doğrulanmış bir gönderici kimliği ile birlikte)
- Bir Google Gemini API Anahtarı (Key)

### 1. Repoyu bilgisayarınıza klonlayın

```bash
git clone https://github.com/erenmente/daily-verb-flow.git
cd daily-verb-flow
```

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

### 3. Çevre Değişkenlerini (Environment Variables) Ayarlayın

Ana dizinde bir `.env` dosyası oluşturun ve bilgilerinizi ekleyin:

```env
# Firebase Kurulumu
FIREBASE_PROJECT_ID=kendi_proje_id_niz
FIREBASE_CLIENT_EMAIL=kendi_client_email_adresiniz
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nKendi_Gizli_Anahtariniz\n-----END PRIVATE KEY-----\n"

# SendGrid Kurulumu
SENDGRID_API_KEY=SG.kendi_api_anahtariniz
SENDGRID_FROM_EMAIL=dogrulanmis_mailiniz@domain.com
SENDGRID_FROM_NAME=Daily Verb Flow

# Google Gemini Kurulumu
GEMINI_API_KEY=kendi_gemini_api_anahtariniz

# Yerel Sunucu Ayarları
PORT=3000
BASE_URL=http://localhost:3000
```

### 4. Veritabanına Başlangıç Verilerini Yükleyin (Seed)

A1'den C1'e kadar olan ilk fiil havuzunu Firestore'a aktarmak için şunu çalıştırın:

```bash
npm run seed-all
```

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm start
```

Uygulama artık `http://localhost:3000` adresinde yayında olacaktır.

## ☁️ Yayına Alma (Deploy - Netlify)

Bu proje, Netlify üzerinde hiçbir ek konfigürasyon (zero-config) gerektirmeden çalışmak üzere optimize edilmiştir.

1. GitHub deponuzu Netlify'a bağlayın.
2. Netlify, `netlify.toml` dosyasındaki ayarları otomatik olarak tanıyacaktır.
3. `.env` dosyanızdaki tüm çevre değişkenlerini **Netlify Environment Variables** (Site Ayarları > Ortam Değişkenleri) sayfasına ekleyin.
4. **Deploy** butonuna tıklayın.

Zamanlanmış fonksiyon (`daily-email.js`), Netlify'ın "Scheduled Functions" özelliğini kullanır ve `netlify.toml` dosyasındaki `0 "5" * * *` kuralına (05:00 UTC / 08:00 TRT) göre her sabah otomatik olarak tetiklenir.

## 📝 Lisans

Bu proje Eren Mente tarafından geliştirilmiştir.

---
*Canlı Demo: [https://daily-verb-flow.netlify.app/](https://daily-verb-flow.netlify.app/)*
