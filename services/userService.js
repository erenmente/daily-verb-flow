const { db } = require("../config/firebase");
const {
  createUserTokens,
  assertDashboardToken,
  hashToken,
  generateToken,
} = require("./authTokenService");
const {
  calculatePlacement,
  calculateLevelFromScore,
} = require("./placementService");
const { sendLoginEmail } = require("./emailService");
const {
  conflict,
  notFound,
  serviceUnavailable,
  unauthorized,
} = require("../utils/errors");

function requireDb() {
  if (!db) {
    throw serviceUnavailable(
      "Firebase yapilandirilmamis. Ortam degiskenlerini kontrol edin.",
    );
  }
  return db;
}

async function registerUser({ name, email }) {
  const database = requireDb();
  const existing = await database
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();
  if (!existing.empty) {
    throw conflict("Bu e-posta adresi zaten kayitli.");
  }

  const tokens = createUserTokens();
  const now = new Date();
  const userRef = await database.collection("users").add({
    name,
    email,
    level: null,
    startDate: now,
    isActive: true,
    totalWordsMemorized: 0,
    learnedWordIds: [],
    wordsSentThisWeek: [],
    reviewQueue: [],
    lastVocabularyDocId: null,
    lastVocabularyCreatedAt: null,
    dashboardAccessTokenHash: tokens.dashboardAccessTokenHash,
    unsubscribeTokenHash: tokens.unsubscribeTokenHash,
    tokenVersion: 1,
    createdAt: now,
    updatedAt: now,
  });

  return {
    userId: userRef.id,
    accessToken: tokens.dashboardAccessToken,
    unsubscribeToken: tokens.unsubscribeToken,
  };
}

async function requestLoginLink({ email }) {
  const database = requireDb();
  const snapshot = await database
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();
  if (snapshot.empty) {
    throw notFound("Bu e-posta adresi ile kayit bulunamadi.");
  }

  const userDoc = snapshot.docs[0];
  const user = userDoc.data();
  let accessToken = null;
  const update = { updatedAt: new Date() };

  if (!user.dashboardAccessTokenHash) {
    const tokens = createUserTokens();
    accessToken = tokens.dashboardAccessToken;
    update.dashboardAccessTokenHash = tokens.dashboardAccessTokenHash;
    update.unsubscribeTokenHash =
      user.unsubscribeTokenHash || tokens.unsubscribeTokenHash;
    update.tokenVersion = 1;
    await userDoc.ref.update(update);
  } else {
    accessToken = generateToken();
    update.dashboardAccessTokenHash = hashToken(accessToken);
    await userDoc.ref.update(update);
  }

  await sendLoginEmail(email, user.name, userDoc.id, accessToken);
  return { sent: true };
}

async function getAuthorizedUser(userId, token) {
  const database = requireDb();
  const doc = await database.collection("users").doc(userId).get();
  if (!doc.exists) {
    throw notFound("Kullanici bulunamadi.");
  }
  const user = doc.data();
  assertDashboardToken(user, token);
  return { doc, user, userId: doc.id };
}

async function submitPlacementTest({
  userId,
  token,
  answers,
  score,
  totalQuestions,
}) {
  const { doc } = await getAuthorizedUser(userId, token);
  const result = answers
    ? calculatePlacement(answers)
    : calculateLevelFromScore(Number(score), Number(totalQuestions));

  await doc.ref.update({
    level: result.level,
    testScore: result.score,
    testTotalQuestions: result.totalQuestions,
    testPercentage: result.percentage,
    testWeightedPercentage: result.weightedPercentage,
    testCompletedAt: new Date(),
    updatedAt: new Date(),
  });

  return result;
}

async function unsubscribeByToken(token) {
  const database = requireDb();
  const tokenHash = hashToken(token);
  const snapshot = await database
    .collection("users")
    .where("unsubscribeTokenHash", "==", tokenHash)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw unauthorized("Gecersiz abonelik iptal tokeni.");
  }

  const doc = snapshot.docs[0];
  await doc.ref.update({
    isActive: false,
    unsubscribedAt: new Date(),
    updatedAt: new Date(),
  });
  return { userId: doc.id };
}

module.exports = {
  requireDb,
  registerUser,
  requestLoginLink,
  getAuthorizedUser,
  submitPlacementTest,
  unsubscribeByToken,
};
