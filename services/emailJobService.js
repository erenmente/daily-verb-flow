const { admin } = require("../config/firebase");
const crypto = require("crypto");
const { requireDb } = require("./userService");
const { createUserTokens } = require("./authTokenService");
const { sendDailyEmail } = require("./emailService");
const { getVerbsForUser } = require("./vocabularyService");
const { toDateKey } = require("../utils/time");

const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_MAX_MS = 8000;

function withoutUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter((entry) => entry[1] !== undefined),
  );
}

async function sendDailyEmailToUser(database, userDoc, dateKey = toDateKey()) {
  const user = userDoc.data();
  const userId = userDoc.id;

  if (!user.level) {
    return { userId, email: user.email, status: "skipped", reason: "no_level" };
  }

  if (user.lastEmailSentDate === dateKey) {
    return {
      userId,
      email: user.email,
      status: "skipped",
      reason: "already_sent_today",
    };
  }

  const selection = await getVerbsForUser(database, user);
  if (selection.verbs.length === 0) {
    return { userId, email: user.email, status: "skipped", reason: "no_verbs" };
  }

  const tokens = createUserTokens();
  const sent = await sendDailyEmail({
    toEmail: user.email,
    userName: user.name,
    verbs: selection.verbs,
    userId,
    accessToken: tokens.dashboardAccessToken,
    unsubscribeToken: tokens.unsubscribeToken,
  });

  if (!sent) {
    return {
      userId,
      email: user.email,
      status: "error",
      reason: "sendgrid_failed",
    };
  }

  const currentWordsThisWeek = Array.isArray(user.wordsSentThisWeek)
    ? user.wordsSentThisWeek
    : [];
  const mergedWeekMap = new Map(
    [...currentWordsThisWeek, ...selection.verbs].map((verb) => [
      verb.id || verb.v1,
      verb,
    ]),
  );

  await userDoc.ref.update({
    dashboardAccessTokenHash: tokens.dashboardAccessTokenHash,
    unsubscribeTokenHash: tokens.unsubscribeTokenHash,
    lastEmailSentAt: new Date(),
    lastEmailSentDate: dateKey,
    reviewQueue: selection.remainingQueue,
    wordsSentThisWeek: Array.from(mergedWeekMap.values()),
    ...selection.nextCursor,
    updatedAt: new Date(),
  });

  return {
    userId,
    email: user.email,
    status: "sent",
    verbCount: selection.verbs.length,
  };
}

async function runDailyEmailJob(options = {}) {
  const database = requireDb();
  const batchSize = Number(
    options.batchSize || process.env.EMAIL_JOB_BATCH_SIZE || DEFAULT_BATCH_SIZE,
  );
  const maxMs = Number(options.maxMs || DEFAULT_MAX_MS);
  const dateKey = options.dateKey || toDateKey();
  const targetEmail = options.email || null;
  const jobId = targetEmail
    ? `${dateKey}_test_${crypto
        .createHash("sha1")
        .update(targetEmail)
        .digest("hex")
        .slice(0, 12)}`
    : dateKey;
  const jobRef = database.collection("email_jobs").doc(jobId);
  const jobDoc = await jobRef.get();
  const job = jobDoc.exists ? jobDoc.data() : {};
  const startTime = Date.now();

  let query = database.collection("users").where("isActive", "==", true);

  if (targetEmail) {
    query = query.where("email", "==", targetEmail).limit(1);
  } else {
    query = query
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(batchSize);
  }

  if (!targetEmail && job.lastUserId) {
    query = database
      .collection("users")
      .where("isActive", "==", true)
      .orderBy(admin.firestore.FieldPath.documentId())
      .startAfter(job.lastUserId)
      .limit(batchSize);
  }

  const snapshot = await query.get();
  const results = [];
  let lastUserId = job.lastUserId || null;

  for (const userDoc of snapshot.docs) {
    if (Date.now() - startTime > maxMs) {
      break;
    }
    let result = null;
    try {
      result = await sendDailyEmailToUser(database, userDoc, dateKey);
    } catch (error) {
      console.error(`Daily email user failed (${userDoc.id}):`, error.message);
      result = {
        userId: userDoc.id,
        email: userDoc.data()?.email || null,
        status: "error",
        reason: error.message,
      };
    }
    results.push(result);
    lastUserId = userDoc.id;
    try {
      await database.collection("email_job_logs").add(
        withoutUndefined({
          jobDate: dateKey,
          ...result,
          createdAt: new Date(),
        }),
      );
    } catch (error) {
      console.warn(
        `Email job log write failed (${userDoc.id}):`,
        error.message,
      );
    }
  }

  const sent = results.filter((result) => result.status === "sent").length;
  const errors = results.filter((result) => result.status === "error").length;
  const skipped = results.filter(
    (result) => result.status === "skipped",
  ).length;
  const hasMore =
    !targetEmail &&
    (snapshot.docs.length === batchSize ||
      results.length < snapshot.docs.length);

  const summary = {
    jobDate: dateKey,
    targetEmail,
    lastUserId,
    processed: (job.processed || 0) + results.length,
    sent: (job.sent || 0) + sent,
    errors: (job.errors || 0) + errors,
    skipped: (job.skipped || 0) + skipped,
    hasMore,
    status: hasMore ? "checkpointed" : "completed",
    updatedAt: new Date(),
    createdAt: job.createdAt || new Date(),
  };

  await jobRef.set(withoutUndefined(summary), { merge: true });
  return { ...summary, results };
}

module.exports = {
  DEFAULT_BATCH_SIZE,
  DEFAULT_MAX_MS,
  sendDailyEmailToUser,
  runDailyEmailJob,
};
