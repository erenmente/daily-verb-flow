const express = require("express");
const {
  validateRegisterBody,
  validateLoginBody,
  validateSubmitTestBody,
  validateSubmitQuizBody,
  normalizeEmail,
  requireUserId,
  requireAccessToken,
} = require("../utils/validation");
const { asyncHandler } = require("../utils/errors");
const {
  registerUser,
  requestLoginLink,
  getAuthorizedUser,
  submitPlacementTest,
  unsubscribeByToken,
} = require("../services/userService");
const { sendDailyEmails } = require("../services/scheduler");
const { getQuizForUser, submitQuiz } = require("../services/quizService");

const router = express.Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = validateRegisterBody(req.body);
    const result = await registerUser(input);

    res.status(201).json({
      success: true,
      userId: result.userId,
      accessToken: result.accessToken,
      message: "Kayit basarili. Simdi seviye testine yonlendiriliyorsunuz.",
    });
  }),
);

router.post(
  "/submit-test",
  asyncHandler(async (req, res) => {
    const input = validateSubmitTestBody(req.body);
    const result = await submitPlacementTest(input);
    res.json({
      success: true,
      ...result,
      message: `Seviyeniz ${result.level} olarak belirlendi.`,
    });
  }),
);

router.get(
  "/unsubscribe/:token",
  asyncHandler(async (req, res) => {
    const token = requireAccessToken(req.params.token);
    await unsubscribeByToken(token);
    res.type("html").send(`<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Abonelik Iptal Edildi</title>
<style>body{font-family:Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;color:#1e293b}.card{background:#fff;border:1px solid #e2e8f0;padding:36px;border-radius:12px;text-align:center;max-width:420px}</style>
</head><body><div class="card"><h2>Aboneliginiz iptal edildi</h2><p>Daily Verb Flow e-postalari artik gonderilmeyecek.</p></div></body></html>`);
  }),
);

router.post(
  "/send-daily",
  asyncHandler(async (req, res) => {
    const email = req.body?.email ? normalizeEmail(req.body.email) : null;
    const result = await sendDailyEmails({ email });
    res.json({ success: true, result });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = validateLoginBody(req.body);
    await requestLoginLink(input);
    res.json({
      success: true,
      message:
        "Guvenli giris baglantisi kayitli e-posta adresinize gonderildi.",
    });
  }),
);

router.get(
  "/dashboard/:userId",
  asyncHandler(async (req, res) => {
    const userId = requireUserId(req.params.userId);
    const token = requireAccessToken(req.query.token);
    const { user } = await getAuthorizedUser(userId, token);

    res.json({
      success: true,
      user: {
        name: user.name,
        level: user.level,
        totalWordsMemorized: user.totalWordsMemorized || 0,
        wordsSentThisWeekCount: (user.wordsSentThisWeek || []).length,
        reviewQueueCount: (user.reviewQueue || []).length,
        isActive: user.isActive,
      },
    });
  }),
);

router.get(
  "/quiz/:userId",
  asyncHandler(async (req, res) => {
    const userId = requireUserId(req.params.userId);
    const token = requireAccessToken(req.query.token);
    const quiz = await getQuizForUser({ userId, token });
    res.json({ success: true, ...quiz });
  }),
);

router.post(
  "/submit-quiz",
  asyncHandler(async (req, res) => {
    const input = validateSubmitQuizBody(req.body);
    const result = await submitQuiz(input);
    res.json({
      success: true,
      message: "Quiz sonuclari kaydedildi.",
      result,
    });
  }),
);

module.exports = router;
