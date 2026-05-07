const questions = require("../public/data/questions.json");
const { badRequest } = require("../utils/errors");

const LEVEL_WEIGHTS = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
};

function levelFromPercent(percent) {
  if (percent <= 20) return "A1";
  if (percent <= 40) return "A2";
  if (percent <= 60) return "B1";
  if (percent <= 80) return "B2";
  return "C1";
}

function calculateLevelFromScore(score, totalQuestions) {
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

  const percentage = Math.round((score / totalQuestions) * 100);
  return {
    level: levelFromPercent(percentage),
    score,
    totalQuestions,
    percentage,
    weightedPercentage: percentage,
  };
}

function calculatePlacement(answers, questionBank = questions) {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw badRequest("Test cevaplari zorunludur.");
  }

  const questionsById = new Map(
    questionBank.map((question) => [Number(question.id), question]),
  );
  const seen = new Set();
  let score = 0;
  let weightedScore = 0;
  let totalWeight = 0;

  for (const answer of answers) {
    if (seen.has(answer.questionId)) {
      throw badRequest("Ayni test sorusu birden fazla gonderilemez.");
    }
    seen.add(answer.questionId);

    const question = questionsById.get(Number(answer.questionId));
    if (!question) {
      throw badRequest("Bilinmeyen test sorusu.");
    }

    const weight = LEVEL_WEIGHTS[question.level] || 1;
    totalWeight += weight;

    if (Number(answer.selectedIndex) === Number(question.correctAnswer)) {
      score++;
      weightedScore += weight;
    }
  }

  const weightedPercentage = Math.round((weightedScore / totalWeight) * 100);
  const percentage = Math.round((score / answers.length) * 100);

  return {
    level: levelFromPercent(weightedPercentage),
    score,
    totalQuestions: answers.length,
    percentage,
    weightedPercentage,
  };
}

module.exports = {
  LEVEL_WEIGHTS,
  calculateLevelFromScore,
  calculatePlacement,
};
