// ===================================
// Landing Page — Form Logic
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const submitBtn = document.getElementById('submit-btn');
    const successState = document.getElementById('success-state');
    const nav = document.getElementById('nav');

    // Nav scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();

        if (!name || !email) {
            showToast('Lütfen tüm alanları doldurun.', 'error');
            return;
        }

        // E-posta validasyonu
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Geçerli bir e-posta adresi girin.', 'error');
            return;
        }

        // Butonu devre dışı bırak
        submitBtn.disabled = true;
        submitBtn.querySelector('.form__btn-text').textContent = 'Kaydediliyor...';

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Bir hata oluştu.');
            }

            // Başarılı kayıt
            form.classList.add('hidden');
            document.querySelector('.card__header').classList.add('hidden');
            successState.classList.remove('hidden');

            // 2 saniye sonra test sayfasına yönlendir
            setTimeout(() => {
                window.location.href = `/test?userId=${data.userId}&name=${encodeURIComponent(name)}`;
            }, 2000);
        } catch (error) {
            showToast(error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.querySelector('.form__btn-text').textContent = 'Kayıt Ol & Teste Başla';
        }
    });

    // Input animasyonları
    document.querySelectorAll('.form__input').forEach((input) => {
        input.addEventListener('focus', () => {
            input.closest('.form__group').classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.closest('.form__group').classList.remove('focused');
        });
    });
});

// Toast mesajı göster
function showToast(message, type = 'error') {
    // Mevcut toast varsa kaldır
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
