document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("u");
  const accessToken = urlParams.get("token");
  const tokenPattern = /^[A-Za-z0-9_-]{32,256}$/;

  if (!userId || !tokenPattern.test(accessToken || "")) {
    window.location.href = "dashboard.html";
    return;
  }

  const quizCard = document.getElementById("quizCard");
  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const resultsCard = document.getElementById("resultsCard");

  let questions = [];
  let currentQuestionIndex = 0;
  let attemptId = null;
  let answers = [];

  const dashboardParams = new URLSearchParams({
    u: userId,
    token: accessToken,
  });
  document.getElementById("backLink").href =
    `dashboard.html?${dashboardParams.toString()}`;
  document.getElementById("errorBtn").href =
    `dashboard.html?${dashboardParams.toString()}`;

  fetchQuizData();

  async function fetchQuizData() {
    try {
      const params = new URLSearchParams({ token: accessToken });
      const res = await fetch(
        `/api/quiz/${encodeURIComponent(userId)}?${params.toString()}`,
      );
      const data = await res.json();

      if (!res.ok || !data.success || data.questions.length === 0) {
        showError(data.message || "Sınav verileri alınamadı.");
        return;
      }

      attemptId = data.attemptId;
      questions = data.questions;
      document.getElementById("totalQuestionsNum").textContent =
        questions.length;

      loadingState.classList.add("hidden");
      quizCard.classList.remove("hidden");

      loadQuestion(0);
    } catch (error) {
      console.error(error);
      showError("Bağlantı hatası oluştu.");
    }
  }

  function showError(msg) {
    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
    document.getElementById("errorMsg").textContent = msg;
  }

  function loadQuestion(index) {
    const q = questions[index];

    document.getElementById("currentQuestionNum").textContent = index + 1;
    document.getElementById("progressFill").style.width =
      `${(index / questions.length) * 100}%`;
    document.getElementById("verbText").textContent = q.verb;
    document.getElementById("verbForms").textContent =
      `${q.correct_v2} -> ${q.correct_v3}`;

    const optionsGrid = document.getElementById("optionsGrid");
    optionsGrid.textContent = "";

    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(opt, q.id, btn);
      optionsGrid.appendChild(btn);
    });
  }

  function handleAnswer(selectedOption, questionId, btnNode) {
    const optionsGrid = document.getElementById("optionsGrid");
    const allBtns = optionsGrid.querySelectorAll(".option-btn");
    allBtns.forEach((button) => {
      button.disabled = true;
    });

    btnNode.classList.add("selected");
    answers.push({ questionId, selectedOption });

    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        loadQuestion(currentQuestionIndex);
      } else {
        showResults();
      }
    }, 500);
  }

  async function showResults() {
    quizCard.classList.add("hidden");
    document.getElementById("progressFill").style.width = "100%";
    document.getElementById("scoreText").textContent = "-";
    document.getElementById("totalScoreText").textContent = questions.length;
    document.getElementById("scoreMessage").textContent =
      "Sonuçlarınız kaydediliyor...";
    resultsCard.classList.remove("hidden");

    const finishBtn = document.getElementById("finishBtn");
    finishBtn.innerHTML = '<span class="btn-text">Kaydediliyor...</span>';
    finishBtn.disabled = true;

    try {
      const res = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          token: accessToken,
          attemptId,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Sınav sonucu kaydedilemedi.");
      }

      const result = data.result;
      document.getElementById("scoreText").textContent = result.score;
      document.getElementById("totalScoreText").textContent =
        result.totalQuestions;
      document.getElementById("scoreMessage").textContent = buildScoreMessage(
        result.score,
        result.totalQuestions,
      );
    } catch (err) {
      console.error("Submit error", err);
      document.getElementById("scoreMessage").textContent =
        err.message || "Sonuç kaydedilemedi.";
    } finally {
      finishBtn.innerHTML = '<span class="btn-text">Panele dön</span>';
      finishBtn.disabled = false;
    }

    finishBtn.onclick = () => {
      window.location.href = `dashboard.html?${dashboardParams.toString()}`;
    };
  }

  function buildScoreMessage(score, total) {
    const perc = total > 0 ? score / total : 0;
    if (perc === 1) return "Kusursuz. Tüm fiilleri hatırladınız.";
    if (perc >= 0.7) return "Çok iyi. Çoğu fiil oturmuş görünüyor.";
    if (perc >= 0.4) return "Fena değil. Biraz daha tekrar iyi gelir.";
    return "Yanlış cevaplanan fiiller tekrar kuyruğuna alındı.";
  }
});
