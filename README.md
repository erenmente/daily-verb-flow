# Daily Verb Flow

Daily Verb Flow is a Node.js/Express + Vanilla JS app for English verb practice. Users register, complete a placement test, receive daily verb emails, review a dashboard, and complete weekly quizzes. The same Express app powers local development and Netlify Functions.

## Architecture

```text
app.js                         Shared Express app factory, CORS, security headers
server.js                      Local server bootstrap and scheduler start
routes/api.js                  All API endpoints
config/firebase.js             Firebase Admin initialization
services/authTokenService.js   Secure token generation and hashing
services/userService.js        Register, login-link, dashboard auth, unsubscribe
services/placementService.js   Backend placement scoring
services/vocabularyService.js  Cursor vocabulary selection and Gemini caching
services/quizService.js        Quiz attempts, backend scoring, idempotent submit
services/emailJobService.js    Scheduled email checkpoint job
services/emailService.js       Escaped SendGrid HTML templates
utils/                         Validation, escaping, errors, date helpers
netlify/functions/api.js       Wraps the shared app with serverless-http
netlify/functions/daily-email.js Runs the shared email job on schedule
public/                        Static frontend
test/                          Node test suite
```

## UI Palette

Daily Verb Flow uses the "Daily Flow" palette:

- Action and habit energy: `#F6820D`
- Email and trust support: `#0052CC`
- Clean surfaces/text: `#FAFAFA`
- Dark structure: `#2D3436`

The orange tone is reserved for primary calls to action. The blue tone supports links, selected states, and email-oriented trust cues without competing with the content.

UI usage rules:

- Backgrounds stay neutral so vocabulary content remains the strongest visual element.
- Orange is reserved for direct actions such as subscribing, saving an email address, starting a test, or entering the panel from an email.
- Email templates keep a dark-gray/light-gray contrast system for readability, with only action buttons using the accent color.

## Local Development

```bash
npm install
cp .env.example .env
npm run seed-all
npm start
```

The app runs at `http://localhost:3000`. Local `/api/*` endpoints and Netlify production `/api/*` endpoints use the same route code.

## Environment Variables

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@erenmente.com
SENDGRID_FROM_NAME=Daily Verb Flow

GEMINI_API_KEY=AIzaXXXXXXXXXXXXXXXXXXXXX

PORT=3000
BASE_URL=http://localhost:3000
APP_ORIGIN=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
EMAIL_JOB_BATCH_SIZE=5
```

`BASE_URL` is used when generating dashboard, quiz, login, and unsubscribe links. `APP_ORIGIN` and `ALLOWED_ORIGINS` control API CORS; production should list only the deployed site origins.

For production, prefer real public URLs in email links:

```env
BASE_URL=https://verb.erenmente.com
APP_ORIGIN=https://verb.erenmente.com
ALLOWED_ORIGINS=https://verb.erenmente.com
```

## Auth And Tokens

Registration creates two cryptographically secure random tokens:

- `dashboardAccessToken`: used for dashboard, placement-test submit, and quiz access.
- `unsubscribeToken`: used only for `/api/unsubscribe/:token`.

Only SHA-256 hashes are stored in Firestore. Login no longer returns `userId` or tokens in the JSON response; it sends a fresh dashboard link to the registered email address. Daily emails also rotate dashboard/unsubscribe tokens and include tokenized links.

## API

- `POST /api/register`
- `POST /api/submit-test`
- `GET /api/unsubscribe/:token`
- `POST /api/login`
- `GET /api/dashboard/:userId?token=...`
- `GET /api/quiz/:userId?token=...`
- `POST /api/submit-quiz`
- `POST /api/send-daily`

Validation errors use a consistent JSON shape:

```json
{ "success": false, "error": { "code": "bad_request", "message": "..." } }
```

## Scheduled Email Job

Local cron runs daily at 08:00 `Europe/Istanbul`. Netlify runs `netlify/functions/daily-email.js` at `0 5 * * *` UTC, which is 08:00 Turkey time.

The email job uses Firestore checkpoints in `email_jobs/{YYYY-MM-DD}` and user-level `lastEmailSentDate` to avoid duplicate same-day sends. Per-user results are written to `email_job_logs`. Vocabulary selection uses `lastVocabularyDocId` cursor state instead of Firestore `offset()`. If stock is low and `GEMINI_API_KEY` is configured, Gemini output is schema-validated and cached in `vocabulary`; invalid output is discarded.

Firestore needs the composite index defined in `firestore.indexes.json` for daily vocabulary selection:

```text
vocabulary: level ASC, createdAt ASC, __name__ ASC
```

If `/api/send-daily` returns `FAILED_PRECONDITION: The query requires an index`, open the Firebase Console link returned in the error response and create the suggested index. It can take a few minutes to become ready.

To test the daily email flow for one user locally:

```powershell
$body = @{ email = "you@example.com" } | ConvertTo-Json
$response = Invoke-WebRequest -UseBasicParsing -Method POST http://localhost:3000/api/send-daily -ContentType "application/json" -Body $body
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

If the response contains `already_sent_today`, clear or backdate that user's `lastEmailSentDate` field in Firestore before re-testing.

## SendGrid Deliverability

Use SendGrid Domain Authentication for the sender domain. The project has been tested with SPF, DKIM, and DMARC passing in Gmail's "Show original" view.

Recommended production sender:

```env
SENDGRID_FROM_EMAIL=noreply@erenmente.com
SENDGRID_FROM_NAME=Daily Verb Flow
```

DNS checklist:

- SendGrid Domain Authentication CNAME records are verified.
- A DMARC TXT record exists, for example `_dmarc` with `v=DMARC1; p=none; rua=mailto:you@example.com; adkim=r; aspf=r`.
- `BASE_URL` points to the production domain rather than `localhost`.

New domains or shared SendGrid IPs can still land in spam at first. Mark test messages as "Not spam" and avoid repeatedly sending identical test emails to the same Gmail inbox in a short window.

## Quiz And Placement

Placement scoring is calculated on the backend from submitted answers with CEFR weights, so clients cannot self-assign a high level by sending only a score. Weekly quiz attempts are stored in `quizAttempts/{userId}_{weekKey}`. Re-submitting a completed attempt returns the stored result and does not increment memorized-word totals again.

## Quality Commands

```bash
npm test
npm run lint
npm run format:check
npm run check
node --check server.js
node --check netlify/functions/api.js
node --check netlify/functions/daily-email.js
```

## Security Notes

Dynamic HTML in email templates is escaped. Dashboard and quiz links are created with DOM APIs and `URLSearchParams`. Production CORS should not use `*`; use `APP_ORIGIN` and `ALLOWED_ORIGINS`. Netlify headers include CSP, HSTS, frame protection, content-type protection, referrer policy, and permissions policy. Abuse protection can be extended with a persistent rate limiter for `/api/register` and `/api/login`.
