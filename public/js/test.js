// ===================================
// Placement Test — Adaptive Logic
// ===================================

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const TOTAL_QUESTIONS = 15;
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

let allQuestions = [];
let currentQuestions = []; // Seçilen 15 soru
let currentIndex = 0;
let score = 0;
let currentLevel = 'A1'; // Adaptive seviye
let userId = null;
let userName = '';

// URL params'dan userId ve name al
const urlParams = new URLSearchParams(window.location.search);
userId = urlParams.get('userId');
userName = urlParams.get('name') || '';

// ===================================
// INIT — Soruları yükle
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/data/questions.json');
        allQuestions = await response.json();

        // Soruları seviyeye göre grupla
        groupQuestionsByLevel();

        // Başlat butonu
        document.getElementById('start-test-btn').addEventListener('click', startTest);
    } catch (error) {
        console.error('Questions load error:', error);
    }
});

// Soruları seviyeye göre grupla
let questionsByLevel = {};
function groupQuestionsByLevel() {
    questionsByLevel = {};
    LEVELS.forEach((level) => {
        questionsByLevel[level] = allQuestions.filter((q) => q.level === level);
        // Shuffle each level
        shuffleArray(questionsByLevel[level]);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ===================================
// ADAPTIVE SORU SEÇİMİ
// ===================================
function selectAdaptiveQuestions() {
    currentQuestions = [];
    const usedIds = new Set();
    let level = 'A1'; // Başlangıç seviyesi

    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        // Mevcut seviyeden soru bul
        let question = findUnusedQuestion(level, usedIds);

        // Bu seviyede soru kalmadıysa, yakın seviyelerden al
        if (!question) {
            const levelIdx = LEVELS.indexOf(level);
            for (let offset = 1; offset < LEVELS.length; offset++) {
                if (levelIdx + offset < LEVELS.length) {
                    question = findUnusedQuestion(LEVELS[levelIdx + offset], usedIds);
                    if (question) break;
                }
                if (levelIdx - offset >= 0) {
                    question = findUnusedQuestion(LEVELS[levelIdx - offset], usedIds);
                    if (question) break;
                }
            }
        }

        if (question) {
            currentQuestions.push({ ...question, adaptiveLevel: level });
            usedIds.add(question.id);
        }
    }
}

function findUnusedQuestion(level, usedIds) {
    return questionsByLevel[level]?.find((q) => !usedIds.has(q.id)) || null;
}

// ===================================
// TEST BAŞLAT
// ===================================
function startTest() {
    selectAdaptiveQuestions();
    currentIndex = 0;
    score = 0;
    currentLevel = 'A1';

    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('question-screen').classList.remove('hidden');

    showQuestion();
}

// ===================================
// SORU GÖSTER
// ===================================
function showQuestion() {
    const question = currentQuestions[currentIndex];
    if (!question) return;

    // Update progress
    const progress = ((currentIndex) / TOTAL_QUESTIONS) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('question-counter').textContent = `Soru ${currentIndex + 1}/${TOTAL_QUESTIONS}`;
    document.getElementById('current-level').textContent = `Seviye: ${currentLevel}`;
    document.getElementById('level-badge').textContent = question.level;

    // Question text
    document.getElementById('question-text').textContent = question.question;

    // Options
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    question.options.forEach((option, i) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.innerHTML = `
      <div class="option__letter">${OPTION_LETTERS[i]}</div>
      <div class="option__text">${option}</div>
    `;
        optionEl.addEventListener('click', () => handleAnswer(i));
        container.appendChild(optionEl);
    });

    // Hide feedback
    document.getElementById('feedback').classList.add('hidden');

    // Reset card state
    const card = document.getElementById('question-card');
    card.classList.remove('correct', 'wrong', 'slide-out');
    card.classList.add('slide-in');
    setTimeout(() => card.classList.remove('slide-in'), 300);
}

// ===================================
// CEVAP İŞLE
// ===================================
function handleAnswer(selectedIndex) {
    const question = currentQuestions[currentIndex];
    const isCorrect = selectedIndex === question.correctAnswer;
    const options = document.querySelectorAll('.option');
    const card = document.getElementById('question-card');
    const feedback = document.getElementById('feedback');

    // Tüm seçenekleri devre dışı bırak
    options.forEach((opt) => opt.classList.add('option--disabled'));

    // Seçilen seçeneği işaretle
    options[selectedIndex].classList.add('option--selected');

    if (isCorrect) {
        score++;
        options[selectedIndex].classList.add('option--correct');
        card.classList.add('correct');

        // Seviye yükselt
        const levelIdx = LEVELS.indexOf(currentLevel);
        if (levelIdx < LEVELS.length - 1) {
            currentLevel = LEVELS[levelIdx + 1];
        }

        // Feedback
        feedback.className = 'question-card__feedback correct';
        document.getElementById('feedback-icon').textContent = '✅';
        document.getElementById('feedback-text').textContent = 'Doğru!';
    } else {
        options[selectedIndex].classList.add('option--wrong');
        options[question.correctAnswer].classList.add('option--correct');
        card.classList.add('wrong');

        // Seviye düşür
        const levelIdx = LEVELS.indexOf(currentLevel);
        if (levelIdx > 0) {
            currentLevel = LEVELS[levelIdx - 1];
        }

        // Feedback
        feedback.className = 'question-card__feedback wrong';
        document.getElementById('feedback-icon').textContent = '❌';
        document.getElementById('feedback-text').textContent = `Yanlış! Doğru cevap: ${question.options[question.correctAnswer]}`;
    }

    feedback.classList.remove('hidden');

    // Sonraki adama ilerlemek için bir sonraki soruyu yükle
    // Soru sayısını ayarla — adaptive olarak soru seçilecek
    if (currentIndex + 1 < currentQuestions.length) {
        // Kalan soruların seviyesini adaptive olarak güncelle
        updateRemainingQuestions();
    }

    // Geçiş animasyonu ile sonraki soru
    setTimeout(() => {
        currentIndex++;

        if (currentIndex >= TOTAL_QUESTIONS) {
            showResult();
        } else {
            card.classList.add('slide-out');
            setTimeout(() => {
                showQuestion();
            }, 300);
        }
    }, 1500);
}

/**
 * Kalan soruları adaptive olarak güncelle
 * Son cevaba göre sonraki soruların seviyesini değiştir
 */
function updateRemainingQuestions() {
    const usedIds = new Set(currentQuestions.slice(0, currentIndex + 1).map((q) => q.id));

    for (let i = currentIndex + 1; i < currentQuestions.length; i++) {
        const newQ = findUnusedQuestion(currentLevel, usedIds);
        if (newQ) {
            currentQuestions[i] = { ...newQ, adaptiveLevel: currentLevel };
            usedIds.add(newQ.id);
        }
    }
}

// ===================================
// SONUÇ GÖSTER
// ===================================
async function showResult() {
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);

    // Seviye hesapla
    let level;
    if (percentage <= 20) level = 'A1';
    else if (percentage <= 40) level = 'A2';
    else if (percentage <= 60) level = 'B1';
    else if (percentage <= 80) level = 'B2';
    else level = 'C1';

    // Ekranı değiştir
    document.getElementById('question-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');

    // Sonuçları yaz
    document.getElementById('result-level-value').textContent = level;
    document.getElementById('result-score').textContent = score;
    document.getElementById('result-total').textContent = TOTAL_QUESTIONS;
    document.getElementById('result-percentage').textContent = `${percentage}%`;

    // Seviyeye göre mesaj
    const messages = {
        A1: '🌱 Başlangıç seviyesindesiniz. Temel fiillerle başlayarak güçlü bir temel atacağız!',
        A2: '📗 Temel seviyeyi geçtiniz! Günlük hayatta sık kullanılan fiilleri öğreneceğiz.',
        B1: '📘 Orta seviyesiniz! Daha karmaşık cümle yapılarına hazırsınız.',
        B2: '📙 Üst orta seviye - harika! İleri düzey fiillerle kendinizi geliştireceksiniz.',
        C1: '🏆 İleri düzeydesiniz! Akademik ve profesyonel fiillerle pratik yapacağız.',
    };

    document.getElementById('result-message').textContent = messages[level];

    // Confetti!
    createConfetti();

    // API'ye gönder
    if (userId) {
        try {
            await fetch('/api/submit-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    score,
                    totalQuestions: TOTAL_QUESTIONS,
                }),
            });
        } catch (error) {
            console.error('Submit test error:', error);
        }
    }
}

// ===================================
// CONFETTI ANIMATION
// ===================================
function createConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 30}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      animation-delay: ${Math.random() * 2}s;
      animation-duration: ${Math.random() * 2 + 2}s;
    `;
        container.appendChild(piece);
    }
}
