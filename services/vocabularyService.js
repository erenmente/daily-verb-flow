const { generateVerbs } = require("./openaiService");
const { requireLevel } = require("../utils/validation");

const DEFAULT_VERBS_PER_USER = 10;
const REVIEW_LIMIT = 3;

function normalizeVerb(verb, level) {
  if (!verb || typeof verb !== "object") return null;
  let normalizedLevel = null;
  try {
    normalizedLevel = requireLevel(verb.level || level);
  } catch {
    return null;
  }

  const normalized = {
    v1: String(verb.v1 || "")
      .trim()
      .toLowerCase(),
    v2: String(verb.v2 || "").trim(),
    v3: String(verb.v3 || "").trim(),
    meaning: String(verb.meaning || "").trim(),
    level: normalizedLevel,
    exampleSentences: Array.isArray(verb.exampleSentences)
      ? verb.exampleSentences.slice(0, 3)
      : [],
  };

  if (
    !normalized.v1 ||
    !normalized.v2 ||
    !normalized.v3 ||
    !normalized.meaning
  ) {
    return null;
  }

  if (
    normalized.exampleSentences.length < 1 ||
    normalized.exampleSentences.some(
      (sentence) => !sentence?.en || !sentence?.tr,
    )
  ) {
    return null;
  }

  normalized.exampleSentences = normalized.exampleSentences.map((sentence) => ({
    en: String(sentence.en).trim(),
    tr: String(sentence.tr).trim(),
  }));

  return normalized;
}

function selectFromVocabularyCursor(vocabulary, cursorId, count) {
  const startIndex = cursorId
    ? vocabulary.findIndex((verb) => verb.id === cursorId) + 1
    : 0;
  const normalizedStart = startIndex > 0 ? startIndex : 0;
  return vocabulary.slice(normalizedStart, normalizedStart + count);
}

async function queryVocabularyPage(database, level, cursorDocId, limit) {
  let query = database
    .collection("vocabulary")
    .where("level", "==", level)
    .orderBy("createdAt", "asc")
    .limit(limit);
  if (cursorDocId) {
    const cursorDoc = await database
      .collection("vocabulary")
      .doc(cursorDocId)
      .get();
    if (cursorDoc.exists) {
      query = database
        .collection("vocabulary")
        .where("level", "==", level)
        .orderBy("createdAt", "asc")
        .startAfter(cursorDoc)
        .limit(limit);
    }
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function verbExists(database, level, v1) {
  const snapshot = await database
    .collection("vocabulary")
    .where("level", "==", level)
    .where("v1", "==", v1)
    .limit(1)
    .get();
  return !snapshot.empty;
}

async function cacheGeneratedVerbs(database, level, count) {
  const generated = await generateVerbs(level, count);
  const cached = [];

  for (const candidate of generated) {
    const verb = normalizeVerb(candidate, level);
    if (!verb) continue;
    if (await verbExists(database, level, verb.v1)) continue;

    const docRef = await database.collection("vocabulary").add({
      ...verb,
      source: "gemini",
      createdAt: new Date(),
    });
    cached.push({ id: docRef.id, ...verb });
  }

  return cached;
}

async function getVerbsForUser(database, user, options = {}) {
  const limit = options.limit || DEFAULT_VERBS_PER_USER;
  const level = requireLevel(user.level);
  const reviewQueue = Array.isArray(user.reviewQueue) ? user.reviewQueue : [];
  const reviewVerbs = reviewQueue
    .slice(0, REVIEW_LIMIT)
    .map((verb) => ({ ...verb, isReview: true }));
  const needCount = Math.max(limit - reviewVerbs.length, 0);

  let newVerbs = await queryVocabularyPage(
    database,
    level,
    user.lastVocabularyDocId,
    needCount,
  );

  if (newVerbs.length < needCount) {
    const generated = await cacheGeneratedVerbs(
      database,
      level,
      needCount - newVerbs.length,
    );
    newVerbs = [...newVerbs, ...generated];
  }

  if (newVerbs.length < needCount) {
    const wrapped = await queryVocabularyPage(
      database,
      level,
      null,
      needCount - newVerbs.length,
    );
    const seen = new Set(newVerbs.map((verb) => verb.id));
    newVerbs = [...newVerbs, ...wrapped.filter((verb) => !seen.has(verb.id))];
  }

  const lastNewVerb = newVerbs[newVerbs.length - 1] || null;
  return {
    verbs: [...reviewVerbs, ...newVerbs],
    newVerbs,
    newVerbsCount: newVerbs.length,
    remainingQueue: reviewQueue.slice(REVIEW_LIMIT),
    nextCursor: lastNewVerb
      ? {
          lastVocabularyDocId: lastNewVerb.id,
          lastVocabularyCreatedAt: lastNewVerb.createdAt || new Date(),
        }
      : {},
  };
}

module.exports = {
  DEFAULT_VERBS_PER_USER,
  REVIEW_LIMIT,
  normalizeVerb,
  selectFromVocabularyCursor,
  getVerbsForUser,
  cacheGeneratedVerbs,
};
