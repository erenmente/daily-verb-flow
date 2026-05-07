const { getAuthorizedUser, requireDb } = require("./userService");
const { badRequest, notFound } = require("../utils/errors");
const { toWeekKey } = require("../utils/time");

function wordKey(word) {
  return String(word.id || word.vocabularyId || word.v1 || "").trim();
}

function uniqueByWord(words) {
  const seen = new Set();
  const result = [];
  for (const word of words || []) {
    const key = wordKey(word);
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(word);
    }
  }
  return result;
}

function buildQuizQuestions(words, random = Math.random) {
  const uniqueWords = uniqueByWord(words);
  if (uniqueWords.length < 4) {
    return [];
  }

  return uniqueWords.map((word) => {
    const wrongOptions = uniqueWords
      .filter((candidate) => wordKey(candidate) !== wordKey(word))
      .map((candidate) => candidate.meaning)
      .sort(() => 0.5 - random())
      .slice(0, 3);

    const options = [...wrongOptions, word.meaning].sort(() => 0.5 - random());
    return {
      id: wordKey(word),
      verb: word.v1,
      correct_v2: word.v2,
      correct_v3: word.v3,
      options,
    };
  });
}

function evaluateQuizSubmission(snapshotWords, answers) {
  const wordsById = new Map(
    uniqueByWord(snapshotWords).map((word) => [wordKey(word), word]),
  );
  const seen = new Set();
  const correctIds = [];
  const incorrectIds = [];

  for (const answer of answers) {
    if (seen.has(answer.questionId)) {
      throw badRequest("Ayni quiz sorusu birden fazla gonderilemez.");
    }
    seen.add(answer.questionId);

    const word = wordsById.get(answer.questionId);
    if (!word) {
      throw badRequest(
        "Quiz cevabi kullanicinin haftalik kelimeleriyle eslesmiyor.",
      );
    }

    if (String(answer.selectedOption) === String(word.meaning)) {
      correctIds.push(answer.questionId);
    } else {
      incorrectIds.push(answer.questionId);
    }
  }

  if (seen.size !== wordsById.size) {
    throw badRequest("Tum quiz sorulari cevaplanmalidir.");
  }

  return {
    score: correctIds.length,
    totalQuestions: wordsById.size,
    correctIds,
    incorrectIds,
  };
}

function mergeReviewQueue(currentQueue, snapshotWords, incorrectIds) {
  const queue = uniqueByWord(currentQueue);
  const byId = new Map(queue.map((word) => [wordKey(word), word]));
  for (const word of snapshotWords) {
    const key = wordKey(word);
    if (incorrectIds.includes(key) && !byId.has(key)) {
      byId.set(key, word);
    }
  }
  return Array.from(byId.values());
}

async function getQuizForUser({ userId, token }) {
  const database = requireDb();
  const { user } = await getAuthorizedUser(userId, token);
  const words = uniqueByWord(user.wordsSentThisWeek || []);

  if (words.length < 4) {
    return {
      questions: [],
      message:
        "Sinav olusturmak icin haftalik en az 4 kelimeniz birikmis olmali.",
    };
  }

  const weekKey = toWeekKey();
  const attemptId = `${userId}_${weekKey}`;
  const attemptRef = database.collection("quizAttempts").doc(attemptId);
  const attemptDoc = await attemptRef.get();

  if (attemptDoc.exists && attemptDoc.data().completedAt) {
    const attempt = attemptDoc.data();
    return {
      attemptId,
      completed: true,
      result: attempt.result,
      questions: [],
      message: "Bu haftaki quiz daha once tamamlandi.",
    };
  }

  if (!attemptDoc.exists) {
    await attemptRef.set({
      userId,
      weekKey,
      questionIds: words.map(wordKey),
      snapshotWords: words,
      createdAt: new Date(),
      completedAt: null,
    });
  }

  return {
    attemptId,
    weekKey,
    questions: buildQuizQuestions(words),
  };
}

async function submitQuiz({ userId, token, attemptId, answers }) {
  const database = requireDb();
  const { doc, user } = await getAuthorizedUser(userId, token);
  if (!attemptId || !attemptId.startsWith(`${userId}_`)) {
    throw badRequest("Gecersiz quiz attempt kimligi.");
  }

  const attemptRef = database.collection("quizAttempts").doc(attemptId);
  const attemptDoc = await attemptRef.get();
  if (!attemptDoc.exists) {
    throw notFound("Quiz attempt bulunamadi.");
  }

  const attempt = attemptDoc.data();
  if (attempt.completedAt) {
    return { idempotent: true, ...attempt.result };
  }

  const result = evaluateQuizSubmission(attempt.snapshotWords || [], answers);
  const newReviewQueue = mergeReviewQueue(
    user.reviewQueue || [],
    attempt.snapshotWords || [],
    result.incorrectIds,
  );
  const learnedWordIds = Array.from(
    new Set([...(user.learnedWordIds || []), ...result.correctIds]),
  );

  await attemptRef.update({
    answers,
    result,
    completedAt: new Date(),
  });

  await doc.ref.update({
    learnedWordIds,
    totalWordsMemorized: learnedWordIds.length,
    reviewQueue: newReviewQueue,
    wordsSentThisWeek: [],
    updatedAt: new Date(),
  });

  return { idempotent: false, ...result };
}

module.exports = {
  wordKey,
  uniqueByWord,
  buildQuizQuestions,
  evaluateQuizSubmission,
  mergeReviewQueue,
  getQuizForUser,
  submitQuiz,
};
