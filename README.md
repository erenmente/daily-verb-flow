# Daily Verb Flow 🚀

Daily Verb Flow is an automated, serverless web application designed to help users improve their English vocabulary effortlessly. It assesses the user's English level through an adaptive placement test and sends daily, personalized email campaigns containing 10 new English verbs (V1, V2, V3) along with example sentences—delivered every morning at 08:00 AM (Turkey Time).

![Daily Verb Flow](public/images/favicon.svg)

## 🌟 Features

- **Modern & Responsive UI**: Glassmorphism design aesthetics for an engaging user experience.
- **Adaptive Placement Test**: A dynamic 15-question test that adjusts difficulty based on user answers to accurately determine their CEFR level (A1 to C1).
- **Automated Daily Emails**: Scheduled cron jobs run every morning to deliver customized vocabulary lists straight to the user's inbox.
- **AI-Powered Content**: Leverages Google Gemini 2.0 Flash to dynamically generate rich example sentences for verbs when seed data runs low, ensuring endless content without manual intervention.
- **Smart Caching Mechanism**: All AI-generated content is cached in the database for future use, drastically reducing API costs and improving performance.
- **Robust Error Handling & Batch Processing**: Designed to handle serverless timeouts by processing email campaigns in batches.

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (No heavy frameworks, raw performance)
- **Backend**: Node.js, Express.js (Wrapped in `serverless-http` for Netlify)
- **Database**: Firebase Firestore (NoSQL for user profiles, vocabulary list, and email logs)
- **Email Delivery**: SendGrid API
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **Hosting & Scheduling**: Netlify Functions (Serverless & Scheduled Functions)
- **Version Control**: Git & GitHub

## 📂 Project Structure

```text
├── netlify/               # Netlify configuration and Serverless Functions
│   └── functions/
│       ├── api.js         # Backend API routes (Registration, Test Handling, Unsubscribe)
│       └── daily-email.js # Scheduled Cron Job for daily email dispatch
├── public/                # Frontend static assets
│   ├── css/               # Stylesheets (style.css, test.css)
│   ├── js/                # Client-side scripts (app.js, test.js)
│   ├── index.html         # Landing/Registration Page
│   └── test.html          # Adaptive Placement Test Page
├── seeds/                 # Database seed scripts for initial vocabulary
├── package.json           # Dependencies and NPM scripts
├── netlify.toml           # Netlify Build and Routing Configuration
└── server.js              # Local Express development server
```

## 🚀 Local Development Setup

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- A Firebase Project (with Firestore enabled)
- A SendGrid Account (with a verified sender identity)
- A Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/erenmente/daily-verb-flow.git
cd daily-verb-flow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add your credentials:
```env
# Firebase Setup
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key\n-----END PRIVATE KEY-----\n"

# SendGrid Setup
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=your_verified_sender@domain.com
SENDGRID_FROM_NAME=Daily Verb Flow

# Google Gemini Setup
GEMINI_API_KEY=your_gemini_api_key

# Local Server Setup
PORT=3000
BASE_URL=http://localhost:3000
```

### 4. Seed the Database
Populate your Firestore with the initial batch of verbs (A1-C1). Run:
```bash
npm run seed-all
```

### 5. Start the Development Server
```bash
npm start
```
The application will be available at `http://localhost:3000`.

## ☁️ Deployment (Netlify)

This project is optimized for a zero-config deployment on Netlify.

1. Connect your GitHub repository to Netlify.
2. Netlify will automatically detect the `netlify.toml` configuration.
3. Add all the environment variables from your `.env` file into **Netlify's Environment Variables** settings (Site Settings > Environment Variables).
4. Click **Deploy**.

The scheduled function (`daily-email.js`) relies on Netlify's Scheduled Functions feature and will automatically trigger at `0 "5" * * *` (05:00 UTC / 08:00 TRT) based on the `netlify.toml` file.

## 📝 License
This project is created by Eren Mente.

---
*Live Demo: [https://daily-verb-flow.netlify.app/](https://daily-verb-flow.netlify.app/)*
