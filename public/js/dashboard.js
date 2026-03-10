document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('u');

    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const userInfoHeader = document.getElementById('userInfoHeader');

    if (userId) {
        // ID var, paneli yükle
        loadDashboard(userId);
    } else {
        // ID yok, login formunu göster
        loginSection.classList.remove('hidden');
    }

    // Login Form Submit
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const btn = document.getElementById('loginBtn');
        const errorDiv = document.getElementById('loginError');

        btn.disabled = true;
        btn.querySelector('.btn-text').textContent = 'Giriş Yapılıyor...';
        errorDiv.classList.add('hidden');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.success) {
                // Başarılı giriş, URL'i güncelle ve paneli yükle
                window.history.pushState({}, '', `?u=${data.userId}`);
                loadDashboard(data.userId);
            } else {
                errorDiv.textContent = data.error || 'Giriş başarısız.';
                errorDiv.classList.remove('hidden');
            }
        } catch (err) {
            errorDiv.textContent = 'Bir bağlantı hatası oluştu.';
            errorDiv.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.querySelector('.btn-text').textContent = 'Giriş Yap';
        }
    });

    async function loadDashboard(uid) {
        loginSection.classList.add('hidden');

        try {
            const res = await fetch(`/api/dashboard/${uid}`);
            const data = await res.json();

            if (!res.ok || !data.success) {
                // Hatalı ID veya silinmiş hesap
                window.history.pushState({}, '', window.location.pathname);
                loginSection.classList.remove('hidden');
                document.getElementById('loginError').textContent = 'Oturum bulunamadı. Lütfen tekrar giriş yapın.';
                document.getElementById('loginError').classList.remove('hidden');
                return;
            }

            const user = data.user;

            // Header
            document.getElementById('headerName').textContent = user.name;
            userInfoHeader.classList.remove('hidden');

            // Stats
            document.getElementById('totalWordsStat').textContent = Math.round(user.totalWordsMemorized || 0);
            document.getElementById('levelStat').textContent = user.level || 'Test Çözülmedi';
            document.getElementById('weekWordsStat').textContent = user.wordsSentThisWeekCount || 0;

            // Quiz Status
            const quizStatusContainer = document.getElementById('quizStatus');
            if (user.wordsSentThisWeekCount >= 4) {
                quizStatusContainer.innerHTML = `
                    <div style="background:rgba(16, 185, 129, 0.1);color:#34d399;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:14px;border:1px solid rgba(16, 185, 129, 0.2);">
                        ✅ Sınavınız hazır! Bu hafta öğrendiğiniz kelimelerden oluşuyor.
                    </div>
                    <a href="quiz.html?u=${uid}" class="btn btn-primary" style="display:inline-block;text-align:center;text-decoration:none;">Sınava Başla</a>
                `;
            } else {
                quizStatusContainer.innerHTML = `
                    <div style="background:rgba(255, 255, 255, 0.05);color:var(--text-muted);padding:12px 16px;border-radius:8px;font-size:14px;border:1px solid rgba(255, 255, 255, 0.1);">
                        ⏳ Sınav oluşturabilmemiz için size bu hafta en az 4 kelime e-postası göndermiş olmalıyız. Şu an ${user.wordsSentThisWeekCount} kelime birikti. Lütfen yarın tekrar kontrol edin.
                    </div>
                `;
            }

            // Review Queue
            if (user.reviewQueueCount > 0) {
                document.getElementById('reviewQueueCard').classList.remove('hidden');
                document.getElementById('queueCount').textContent = user.reviewQueueCount;
            }

            // Show Dashboard
            dashboardSection.classList.remove('hidden');

        } catch (error) {
            console.error('Dashboard load error', error);
            alert('Bilgileriniz yüklenirken bir hata oluştu.');
        }
    }
});
