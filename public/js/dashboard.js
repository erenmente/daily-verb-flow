document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("u");
  const accessToken = urlParams.get("token");
  const tokenPattern = /^[A-Za-z0-9_-]{32,256}$/;

  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const userInfoHeader = document.getElementById("userInfoHeader");

  if (userId && tokenPattern.test(accessToken || "")) {
    loadDashboard(userId, accessToken);
  } else {
    loginSection.classList.remove("hidden");
  }

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document
      .getElementById("loginEmail")
      .value.trim()
      .toLowerCase();
    const btn = document.getElementById("loginBtn");
    const errorDiv = document.getElementById("loginError");

    btn.disabled = true;
    btn.querySelector(".btn-text").textContent = "Bağlantı gönderiliyor...";
    errorDiv.classList.add("hidden");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(getApiMessage(data) || "Giriş başarısız.");
      }

      errorDiv.textContent =
        data.message || "Güvenli giriş bağlantısı e-postanıza gönderildi.";
      errorDiv.classList.remove("hidden");
    } catch (err) {
      errorDiv.textContent = err.message || "Bir bağlantı hatası oluştu.";
      errorDiv.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.querySelector(".btn-text").textContent = "Giriş bağlantısı gönder";
    }
  });

  async function loadDashboard(uid, token) {
    loginSection.classList.add("hidden");

    try {
      const params = new URLSearchParams({ token });
      const res = await fetch(
        `/api/dashboard/${encodeURIComponent(uid)}?${params.toString()}`,
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        window.history.pushState({}, "", window.location.pathname);
        loginSection.classList.remove("hidden");
        document.getElementById("loginError").textContent =
          "Oturum bulunamadı. Lütfen tekrar giriş bağlantısı isteyin.";
        document.getElementById("loginError").classList.remove("hidden");
        return;
      }

      const user = data.user;
      document.getElementById("headerName").textContent = user.name;
      userInfoHeader.classList.remove("hidden");

      document.getElementById("totalWordsStat").textContent = Math.round(
        user.totalWordsMemorized || 0,
      );
      document.getElementById("levelStat").textContent =
        user.level || "Test çözülmedi";
      document.getElementById("weekWordsStat").textContent =
        user.wordsSentThisWeekCount || 0;

      renderQuizStatus(uid, token, user.wordsSentThisWeekCount || 0);

      if (user.reviewQueueCount > 0) {
        document.getElementById("reviewQueueCard").classList.remove("hidden");
        document.getElementById("queueCount").textContent =
          user.reviewQueueCount;
      }

      dashboardSection.classList.remove("hidden");
    } catch (error) {
      console.error("Dashboard load error", error);
      alert("Bilgileriniz yüklenirken bir hata oluştu.");
    }
  }

  function getApiMessage(data) {
    if (!data) return null;
    if (typeof data.error === "string") return data.error;
    if (data.error?.message) return data.error.message;
    if (data.message) return data.message;
    return null;
  }

  function renderQuizStatus(uid, token, wordsSentThisWeekCount) {
    const quizStatusContainer = document.getElementById("quizStatus");
    quizStatusContainer.textContent = "";

    const status = document.createElement("div");
    status.setAttribute(
      "style",
      wordsSentThisWeekCount >= 4
        ? "background:rgba(20, 184, 166, 0.1);color:#99f6e4;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:14px;border:1px solid rgba(20, 184, 166, 0.24);"
        : "background:rgba(255, 255, 255, 0.04);color:var(--text-muted);padding:12px 16px;border-radius:8px;font-size:14px;border:1px solid rgba(255, 255, 255, 0.1);",
    );

    if (wordsSentThisWeekCount >= 4) {
      status.textContent =
        "Sınavınız hazır. Bu hafta çalıştığınız fiillerden oluşuyor.";
      const link = document.createElement("a");
      const quizParams = new URLSearchParams({ u: uid, token });
      link.href = `quiz.html?${quizParams.toString()}`;
      link.className = "btn btn-primary";
      link.setAttribute(
        "style",
        "display:inline-block;text-align:center;text-decoration:none;",
      );
      link.textContent = "Sınava başla";
      quizStatusContainer.append(status, link);
      return;
    }

    status.textContent = `Sınav oluşturmak için bu hafta en az 4 fiil birikmeli. Şu an ${wordsSentThisWeekCount} fiil var.`;
    quizStatusContainer.appendChild(status);
  }
});
