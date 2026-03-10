document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('u');

    if (!userId) {
        window.location.href = 'dashboard.html';
        return;
    }

    const quizCard = document.getElementById('quizCard');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const resultsCard = document.getElementById('resultsCard');

    let questions = [];
    let currentQuestionIndex = 0;

    let correctIds = [];
    let incorrectIds = [];

    // Initialize Quiz
    fetchQuizData();

    async function fetchQuizData() {
        try {
            const res = await fetch(`/api/quiz/${userId}`);
            const data = await res.json();

            if (!res.ok || !data.success || data.questions.length === 0) {
                showError(data.message || 'Sınav verileri alınamadı.');
                return;
            }

            questions = data.questions;
            document.getElementById('totalQuestionsNum').textContent = questions.length;

            loadingState.classList.add('hidden');
            quizCard.classList.remove('hidden');

            loadQuestion(0);

        } catch (error) {
            console.error(error);
            showError('Bağlantı hatası oluştu.');
        }
    }

    function showError(msg) {
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        document.getElementById('errorMsg').textContent = msg;
    }

    function loadQuestion(index) {
        const q = questions[index];

        document.getElementById('currentQuestionNum').textContent = index + 1;

        // Progress bar
        const progressPercent = ((index) / questions.length) * 100;
        document.getElementById('progressFill').style.width = `${progressPercent}%`;

        document.getElementById('verbText').textContent = q.verb;
        document.getElementById('verbForms').textContent = `${q.correct_v2} → ${q.correct_v3}`;

        const optionsGrid = document.getElementById('optionsGrid');
        optionsGrid.innerHTML = '';

        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => handleAnswer(opt, q.correctOption, q.id, btn);
            optionsGrid.appendChild(btn);
        });
    }

    function handleAnswer(selectedOption, correctOption, verbId, btnNode) {
        const optionsGrid = document.getElementById('optionsGrid');
        const allBtns = optionsGrid.querySelectorAll('.option-btn');
        allBtns.forEach(b => b.disabled = true);

        const isCorrect = selectedOption === correctOption;

        if (isCorrect) {
            btnNode.classList.add('correct');
            correctIds.push(verbId);
        } else {
            btnNode.classList.add('wrong');
            incorrectIds.push(verbId);

            // Highlight the correct one
            allBtns.forEach(b => {
                if (b.textContent === correctOption) {
                    b.classList.add('correct');
                }
            });
        }

        // Wait a bit, then move to next
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                loadQuestion(currentQuestionIndex);
            } else {
                showResults();
            }
        }, 1500);
    }

    async function showResults() {
        quizCard.classList.add('hidden');
        document.getElementById('progressFill').style.width = '100%';

        const score = correctIds.length;
        const total = questions.length;

        document.getElementById('scoreText').textContent = score;
        document.getElementById('totalScoreText').textContent = total;

        const perc = score / total;
        let msg = '';
        if (perc === 1) msg = "Kusursuz! 🏆 Tüm kelimeleri harika hatırlıyorsunuz.";
        else if (perc >= 0.7) msg = "Çok iyi! 👏 Çoğu kelimeyi kapmışsınız.";
        else if (perc >= 0.4) msg = "Fena değil! 👍 Biraz daha tekrara ihtiyacınız var.";
        else msg = "Pes etmeyin! 💪 Yanlış bildiklerinizi size tekrar gönderip öğreteceğiz.";

        document.getElementById('scoreMessage').textContent = msg;

        resultsCard.classList.remove('hidden');

        // Submit results to backend
        const finishBtn = document.getElementById('finishBtn');
        finishBtn.innerHTML = '<span class="btn-text">Kaydediliyor... ⏳</span>';
        finishBtn.disabled = true;

        try {
            await fetch('/api/submit-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, correctIds, incorrectIds })
            });
            finishBtn.innerHTML = '<span class="btn-text">Sonuçları Kaydet ve Çık</span>';
            finishBtn.disabled = false;
        } catch (err) {
            console.error('Submit error', err);
            finishBtn.innerHTML = '<span class="btn-text">Sonuçları Kaydet ve Çık</span>';
            finishBtn.disabled = false;
        }

        finishBtn.onclick = () => {
            window.location.href = `dashboard.html?u=${userId}`;
        };
    }
});
