const sgMail = require("@sendgrid/mail");
const { escapeHtml, escapeAttribute } = require("../utils/escapeHtml");

if (
  process.env.SENDGRID_API_KEY &&
  process.env.SENDGRID_API_KEY.startsWith("SG.")
) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn(
    "SendGrid API key eksik veya gecersiz; e-posta gonderimi devre disi.",
  );
}

function getBaseUrl() {
  return (
    process.env.BASE_URL ||
    process.env.URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function buildDailyEmailHtml({
  userName,
  verbs,
  userId,
  accessToken,
  unsubscribeToken,
  date = new Date(),
}) {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe/${encodeURIComponent(unsubscribeToken)}`;
  const dashboardUrl = `${baseUrl}/dashboard.html?u=${encodeURIComponent(userId)}&token=${encodeURIComponent(
    accessToken,
  )}`;
  const isSunday = date.getDay() === 0;

  const verbRows = verbs
    .map((verb, index) => {
      const examples = Array.isArray(verb.exampleSentences)
        ? verb.exampleSentences
        : [];
      const reviewBadge = verb.isReview
        ? '<span style="background:#fef08a;color:#854d0e;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:bold;margin-left:6px;">TEKRAR</span>'
        : "";

      return `
    <tr>
      <td style="padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin:12px 0;">
          <tr>
            <td style="padding:20px 24px;">
              <div style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Fiil #${
                index + 1
              } ${reviewBadge}</div>
              <div style="font-size:22px;font-weight:700;color:#1e293b;margin-bottom:4px;">${escapeHtml(
                verb.v1,
              )} &rarr; ${escapeHtml(verb.v2)} &rarr; ${escapeHtml(verb.v3)}</div>
              <div style="font-size:15px;color:#2d3436;font-weight:600;">${escapeHtml(verb.meaning)}</div>
            </td>
          </tr>
          ${examples
            .map(
              (sentence, sentenceIndex) => `
          <tr>
            <td style="padding:4px 24px ${
              sentenceIndex === examples.length - 1 ? "20px" : "4px"
            } 24px;">
              <div style="background:#fff;border-radius:8px;padding:12px 16px;border-left:3px solid #cbd5e1;">
                <div style="font-size:14px;color:#1e293b;margin-bottom:4px;">${escapeHtml(sentence.en)}</div>
                <div style="font-size:13px;color:#64748b;">${escapeHtml(sentence.tr)}</div>
              </div>
            </td>
          </tr>`,
            )
            .join("")}
        </table>
      </td>
    </tr>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
<tr><td style="background:#fff;padding:34px 32px;text-align:center;border-bottom:1px solid #e5e7eb;">
  <h1 style="color:#111827;font-size:26px;margin:0 0 8px;font-weight:700;">Daily Verb Flow</h1>
  <p style="color:#4b5563;font-size:15px;margin:0;">Gunluk fiil akisin hazir.</p>
</td></tr>
<tr><td style="padding:32px 32px 8px;">
  <p style="font-size:16px;color:#334155;margin:0;">Merhaba <strong>${escapeHtml(userName)}</strong></p>
  <p style="font-size:14px;color:#64748b;margin:8px 0 0;">Bugunku ${verbs.length} fiilin burada.</p>
</td></tr>
<tr><td style="padding:8px 24px 24px;"><table width="100%" cellpadding="0" cellspacing="0">${verbRows}</table></td></tr>
<tr><td style="padding:16px 32px;text-align:center;">
  ${
    isSunday
      ? `<a href="${escapeAttribute(dashboardUrl)}" style="display:inline-block;padding:14px 28px;background:#f6820d;color:#fff;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">Haftalik sinaviniz hazir</a>`
      : `<a href="${escapeAttribute(dashboardUrl)}" style="display:inline-block;padding:12px 24px;background:#f6820d;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:700;">Gelisim panelini goruntule</a>`
  }
</td></tr>
<tr><td style="padding:24px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;">Bu e-postayi Daily Verb Flow aboneliginiz kapsaminda aldiniz.</p>
  <a href="${escapeAttribute(unsubscribeUrl)}" style="display:inline-block;padding:10px 24px;background:#fff;color:#991b1b;border:1px solid #fecaca;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Abonelikten cik</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildDailyEmailText({
  userName,
  verbs,
  userId,
  accessToken,
  unsubscribeToken,
}) {
  const baseUrl = getBaseUrl();
  const dashboardUrl = `${baseUrl}/dashboard.html?u=${encodeURIComponent(userId)}&token=${encodeURIComponent(
    accessToken,
  )}`;
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe/${encodeURIComponent(unsubscribeToken)}`;
  const lines = [
    `Merhaba ${userName},`,
    "",
    "Bugunku Daily Verb Flow fiilleriniz:",
    "",
    ...verbs.flatMap((verb, index) => [
      `${index + 1}. ${verb.v1} -> ${verb.v2} -> ${verb.v3}: ${verb.meaning}`,
      ...(Array.isArray(verb.exampleSentences)
        ? verb.exampleSentences.map(
            (sentence) => `- ${sentence.en} / ${sentence.tr}`,
          )
        : []),
      "",
    ]),
    `Gelisim paneli: ${dashboardUrl}`,
    `Abonelikten cik: ${unsubscribeUrl}`,
  ];

  return lines.join("\n");
}

function buildLoginEmailHtml({ userName, userId, accessToken }) {
  const dashboardUrl = `${getBaseUrl()}/dashboard.html?u=${encodeURIComponent(userId)}&token=${encodeURIComponent(
    accessToken,
  )}`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
        <tr><td>
          <h1 style="font-size:22px;color:#1e293b;margin:0 0 12px;">Daily Verb Flow panel girisi</h1>
          <p style="font-size:15px;color:#475569;">Merhaba ${escapeHtml(
            userName,
          )}, panelinize guvenli baglanti ile girmek icin asagidaki dugmeyi kullanin.</p>
          <p><a href="${escapeAttribute(
            dashboardUrl,
          )}" style="display:inline-block;background:#f6820d;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold;">Panele gir</a></p>
          <p style="font-size:12px;color:#94a3b8;">Bu baglanti yeni bir giris istegiyle yenilenir. E-postayi siz istemediyseniz yok sayabilirsiniz.</p>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

async function sendMail(message) {
  if (
    !process.env.SENDGRID_API_KEY ||
    !process.env.SENDGRID_API_KEY.startsWith("SG.")
  ) {
    console.warn(
      `E-posta gonderilmedi; SendGrid yapilandirilmamis: ${message.to}`,
    );
    return false;
  }

  try {
    await sgMail.send(message);
    return true;
  } catch (error) {
    console.error(`Email send error for ${message.to}:`, error.message);
    return false;
  }
}

async function sendDailyEmail({
  toEmail,
  userName,
  verbs,
  userId,
  accessToken,
  unsubscribeToken,
}) {
  const unsubscribeUrl = `${getBaseUrl()}/api/unsubscribe/${encodeURIComponent(unsubscribeToken)}`;
  return sendMail({
    to: toEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || "noreply@dailyverbflow.com",
      name: process.env.SENDGRID_FROM_NAME || "Daily Verb Flow",
    },
    subject: `Gunluk fiillerin hazir, ${userName}!`,
    html: buildDailyEmailHtml({
      userName,
      verbs,
      userId,
      accessToken,
      unsubscribeToken,
    }),
    text: buildDailyEmailText({
      userName,
      verbs,
      userId,
      accessToken,
      unsubscribeToken,
    }),
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
    },
  });
}

async function sendLoginEmail(toEmail, userName, userId, accessToken) {
  return sendMail({
    to: toEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || "noreply@dailyverbflow.com",
      name: process.env.SENDGRID_FROM_NAME || "Daily Verb Flow",
    },
    subject: "Daily Verb Flow panel giris baglantiniz",
    html: buildLoginEmailHtml({ userName, userId, accessToken }),
  });
}

module.exports = {
  buildDailyEmailHtml,
  buildDailyEmailText,
  buildLoginEmailHtml,
  sendDailyEmail,
  sendLoginEmail,
};
