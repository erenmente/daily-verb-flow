const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('⚠️  SendGrid API key eksik veya geçersiz — e-posta gönderimi devre dışı.');
}

/**
 * Günlük fiil e-postası gönderir
 * @param {string} toEmail - Alıcı e-posta
 * @param {string} userName - Kullanıcı adı
 * @param {Array} verbs - Gönderilecek fiil listesi
 * @param {string} userId - Kullanıcı ID (unsubscribe için)
 */
async function sendDailyEmail(toEmail, userName, verbs, userId) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe/${userId}`;

  const verbRows = verbs
    .map(
      (verb, i) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td colspan="3" style="padding: 0;">
          <!-- Verb Header -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea22, #764ba222); border-radius: 12px; margin: 12px 0;">
            <tr>
              <td style="padding: 20px 24px;">
                <div style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Fiil #${i + 1}</div>
                <div style="font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                  ${verb.v1} &nbsp;→&nbsp; ${verb.v2} &nbsp;→&nbsp; ${verb.v3}
                </div>
                <div style="font-size: 15px; color: #6366f1; font-weight: 600;">
                  🇹🇷 ${verb.meaning}
                </div>
              </td>
            </tr>
            <!-- Example Sentences -->
            ${verb.exampleSentences
          .map(
            (s, si) => `
              <tr>
                <td style="padding: 4px 24px ${si === verb.exampleSentences.length - 1 ? '20px' : '4px'} 24px;">
                  <div style="background: white; border-radius: 8px; padding: 12px 16px; margin-bottom: 4px; border-left: 3px solid ${si === 0 ? '#6366f1' : si === 1 ? '#8b5cf6' : '#a78bfa'};">
                    <div style="font-size: 14px; color: #1e293b; margin-bottom: 4px;">🇬🇧 ${s.en}</div>
                    <div style="font-size: 13px; color: #64748b;">🇹🇷 ${s.tr}</div>
                  </div>
                </td>
              </tr>
            `
          )
          .join('')}
          </table>
        </td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa); padding: 40px 32px; text-align: center;">
              <div style="font-size: 36px; margin-bottom: 8px;">📚</div>
              <h1 style="color: white; font-size: 26px; margin: 0 0 8px 0; font-weight: 700;">Daily Verb Flow</h1>
              <p style="color: rgba(255,255,255,0.85); font-size: 15px; margin: 0;">Günlük Fiil Akışın Hazır!</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 8px 32px;">
              <p style="font-size: 16px; color: #334155; margin: 0;">
                Merhaba <strong>${userName}</strong> 👋
              </p>
              <p style="font-size: 14px; color: #64748b; margin: 8px 0 0 0;">
                İşte bugünkü 10 fiilin! Her birini V1-V2-V3 halleriyle ve örnek cümlelerle öğren.
              </p>
            </td>
          </tr>

          <!-- Verbs -->
          <tr>
            <td style="padding: 8px 24px 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${verbRows}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 13px; color: #94a3b8; margin: 0 0 16px 0;">
                Bu e-postayı Daily Verb Flow aboneliğiniz kapsamında aldınız.
              </p>
              <a href="${unsubscribeUrl}" style="display: inline-block; padding: 10px 24px; background: #fee2e2; color: #dc2626; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
                ❌ Abonelikten Çık
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const msg = {
    to: toEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@dailyverbflow.com',
      name: process.env.SENDGRID_FROM_NAME || 'Daily Verb Flow',
    },
    subject: `📚 Günlük Fiillerin Hazır, ${userName}!`,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Email send error for ${toEmail}:`, error.message);
    if (error.response) {
      console.error(error.response.body);
    }
    return false;
  }
}

module.exports = { sendDailyEmail };
