const { badRequest } = require("./errors");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_ID_RE = /^[A-Za-z0-9_-]{6,128}$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{32,256}$/;
const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

function normalizeEmail(email) {
  if (typeof email !== "string") {
    throw badRequest("Gecerli bir e-posta adresi girin.");
  }
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254 || !EMAIL_RE.test(normalized)) {
    throw badRequest("Gecerli bir e-posta adresi girin.");
  }
  return normalized;
}

function normalizeName(name) {
  if (typeof name !== "string") {
    throw badRequest("Ad alani zorunludur.");
  }
  const normalized = name.trim().replace(/\s+/g, " ");
  if (normalized.length < 2 || normalized.length > 80) {
    throw badRequest("Ad 2 ile 80 karakter arasinda olmalidir.");
  }
  if (/[<>{}[\]\\]/.test(normalized)) {
    throw badRequest("Ad alani desteklenmeyen karakterler iceriyor.");
  }
  return normalized;
}

function requireUserId(userId) {
  if (typeof userId !== "string" || !USER_ID_RE.test(userId)) {
    throw badRequest("Gecersiz kullanici kimligi.");
  }
  return userId;
}

function optionalAccessToken(token) {
  if (token === undefined || token === null || token === "") {
    return null;
  }
  if (typeof token !== "string" || !TOKEN_RE.test(token)) {
    throw badRequest("Gecersiz erisim tokeni.");
  }
  return token;
}

function requireAccessToken(token) {
  const normalized = optionalAccessToken(token);
  if (!normalized) {
    throw badRequest("Erisim tokeni zorunludur.");
  }
  return normalized;
}

function requireLevel(level) {
  if (!LEVELS.includes(level)) {
    throw badRequest("Gecersiz seviye.");
  }
  return level;
}

function validateRegisterBody(body = {}) {
  return {
    name: normalizeName(body.name),
    email: normalizeEmail(body.email),
  };
}

function validateLoginBody(body = {}) {
  return { email: normalizeEmail(body.email) };
}

function validateSubmitTestBody(body = {}) {
  const userId = requireUserId(body.userId);
  const token = requireAccessToken(body.token || body.accessToken);

  if (Array.isArray(body.answers)) {
    const answers = body.answers.map((answer) => {
      const questionId = Number(answer.questionId);
      const selectedIndex = Number(answer.selectedIndex);
      if (!Number.isInteger(questionId) || questionId <= 0) {
        throw badRequest("Gecersiz test soru kimligi.");
      }
      if (
        !Number.isInteger(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex > 3
      ) {
        throw badRequest("Gecersiz test cevabi.");
      }
      return { questionId, selectedIndex };
    });

    if (answers.length === 0 || answers.length > 50) {
      throw badRequest("Test cevap sayisi gecersiz.");
    }
    return { userId, token, answers };
  }

  const score = Number(body.score);
  const totalQuestions = Number(body.totalQuestions);
  if (
    !Number.isInteger(score) ||
    !Number.isInteger(totalQuestions) ||
    totalQuestions <= 0
  ) {
    throw badRequest("Skor ve soru sayisi tamsayi olmalidir.");
  }
  if (score < 0 || score > totalQuestions) {
    throw badRequest("Skor toplam soru sayisindan buyuk olamaz.");
  }
  return { userId, token, score, totalQuestions };
}

function validateQuizAnswers(answers) {
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > 100) {
    throw badRequest("Quiz cevaplari gecersiz.");
  }

  return answers.map((answer) => {
    const questionId = String(answer.questionId || "").trim();
    const selectedOption = String(answer.selectedOption || "").trim();
    if (!questionId || questionId.length > 128) {
      throw badRequest("Gecersiz quiz soru kimligi.");
    }
    if (!selectedOption || selectedOption.length > 200) {
      throw badRequest("Gecersiz quiz cevabi.");
    }
    return { questionId, selectedOption };
  });
}

function validateSubmitQuizBody(body = {}) {
  return {
    userId: requireUserId(body.userId),
    token: requireAccessToken(body.token || body.accessToken),
    attemptId: String(body.attemptId || "").trim(),
    answers: validateQuizAnswers(body.answers),
  };
}

module.exports = {
  LEVELS,
  normalizeEmail,
  normalizeName,
  requireUserId,
  optionalAccessToken,
  requireAccessToken,
  requireLevel,
  validateRegisterBody,
  validateLoginBody,
  validateSubmitTestBody,
  validateSubmitQuizBody,
  validateQuizAnswers,
};
