const test = require("node:test");
const assert = require("node:assert/strict");

process.env.FIREBASE_PROJECT_ID = "";
process.env.FIREBASE_CLIENT_EMAIL = "";
process.env.FIREBASE_PRIVATE_KEY = "";
process.env.GEMINI_API_KEY = "";

const { escapeHtml } = require("../utils/escapeHtml");
const {
  normalizeEmail,
  normalizeName,
  validateSubmitTestBody,
} = require("../utils/validation");
const { calculatePlacement } = require("../services/placementService");
const {
  evaluateQuizSubmission,
  mergeReviewQueue,
  buildQuizQuestions,
} = require("../services/quizService");
const {
  normalizeVerb,
  selectFromVocabularyCursor,
} = require("../services/vocabularyService");

test("normalizes registration input", () => {
  assert.equal(normalizeEmail("  USER@Example.COM  "), "user@example.com");
  assert.equal(normalizeName("  Ada   Lovelace  "), "Ada Lovelace");
});

test("rejects invalid email and impossible placement score", () => {
  assert.throws(() => normalizeEmail("not-an-email"), /e-posta/);
  assert.throws(
    () =>
      validateSubmitTestBody({
        userId: "user_12345",
        token: "a".repeat(43),
        score: 16,
        totalQuestions: 15,
      }),
    /Skor/,
  );
});

test("escapes dynamic html fields", () => {
  assert.equal(
    escapeHtml("<img src=x onerror=alert(1)>"),
    "&lt;img src=x onerror=alert(1)&gt;",
  );
});

test("calculates placement level from weighted answers", () => {
  const questionBank = [
    { id: 1, level: "A1", correctAnswer: 0 },
    { id: 2, level: "C1", correctAnswer: 1 },
  ];

  const low = calculatePlacement(
    [
      { questionId: 1, selectedIndex: 0 },
      { questionId: 2, selectedIndex: 0 },
    ],
    questionBank,
  );
  const high = calculatePlacement(
    [
      { questionId: 1, selectedIndex: 0 },
      { questionId: 2, selectedIndex: 1 },
    ],
    questionBank,
  );

  assert.equal(low.level, "A1");
  assert.equal(high.level, "C1");
});

test("quiz submission is evaluated from backend snapshot", () => {
  const words = [
    { id: "w1", v1: "go", meaning: "gitmek" },
    { id: "w2", v1: "eat", meaning: "yemek" },
  ];
  const result = evaluateQuizSubmission(words, [
    { questionId: "w1", selectedOption: "gitmek" },
    { questionId: "w2", selectedOption: "wrong" },
  ]);

  assert.deepEqual(result.correctIds, ["w1"]);
  assert.deepEqual(result.incorrectIds, ["w2"]);
  assert.equal(result.score, 1);
});

test("quiz rejects fake or duplicate answers", () => {
  const words = [{ id: "w1", v1: "go", meaning: "gitmek" }];
  assert.throws(
    () =>
      evaluateQuizSubmission(words, [
        { questionId: "other", selectedOption: "gitmek" },
      ]),
    /eslesmiyor/,
  );
  assert.throws(
    () =>
      evaluateQuizSubmission(words, [
        { questionId: "w1", selectedOption: "gitmek" },
        { questionId: "w1", selectedOption: "gitmek" },
      ]),
    /birden fazla/,
  );
});

test("review queue merge avoids duplicates", () => {
  const merged = mergeReviewQueue(
    [{ id: "w1", v1: "go" }],
    [
      { id: "w1", v1: "go" },
      { id: "w2", v1: "eat" },
    ],
    ["w1", "w2"],
  );
  assert.deepEqual(
    merged.map((word) => word.id),
    ["w1", "w2"],
  );
});

test("quiz questions hide correct option metadata", () => {
  const questions = buildQuizQuestions([
    { id: "w1", v1: "go", v2: "went", v3: "gone", meaning: "gitmek" },
    { id: "w2", v1: "eat", v2: "ate", v3: "eaten", meaning: "yemek" },
    { id: "w3", v1: "see", v2: "saw", v3: "seen", meaning: "gormek" },
    { id: "w4", v1: "write", v2: "wrote", v3: "written", meaning: "yazmak" },
  ]);
  assert.equal(questions.length, 4);
  assert.equal(Object.hasOwn(questions[0], "correctOption"), false);
});

test("vocabulary cursor selection avoids offset style indexing", () => {
  const vocabulary = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.deepEqual(selectFromVocabularyCursor(vocabulary, "a", 2), [
    { id: "b" },
    { id: "c" },
  ]);
});

test("gemini generated verb validation rejects incomplete output", () => {
  assert.equal(normalizeVerb({ v1: "go" }, "A1"), null);
  assert.equal(
    normalizeVerb(
      {
        v1: "go",
        v2: "went",
        v3: "gone",
        meaning: "gitmek",
        level: "A1",
        exampleSentences: [{ en: "I go.", tr: "Giderim." }],
      },
      "A1",
    ).v1,
    "go",
  );
});
