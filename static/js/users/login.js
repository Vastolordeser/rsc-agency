// login.js - Скрипты для страницы входа

// Переключение видимости пароля
function togglePassword(id) {
    const input = document.getElementById(id);
    const btn = input.nextElementSibling;
    const icon = btn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Анимация появления элементов
function animateLoginForm() {
    const container = document.querySelector('.login-container');
    const visual = document.querySelector('.login-visual');
    const formCard = document.querySelector('.login-form-card');
    
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(30px)';
        setTimeout(() => {
            container.style.transition = 'all 0.5s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
    
    if (visual) {
        visual.style.opacity = '0';
        visual.style.transform = 'translateX(-30px)';
        setTimeout(() => {
            visual.style.transition = 'all 0.5s ease 0.2s';
            visual.style.opacity = '1';
            visual.style.transform = 'translateX(0)';
        }, 150);
    }
    
    if (formCard) {
        formCard.style.opacity = '0';
        formCard.style.transform = 'translateX(30px)';
        setTimeout(() => {
            formCard.style.transition = 'all 0.5s ease 0.3s';
            formCard.style.opacity = '1';
            formCard.style.transform = 'translateX(0)';
        }, 200);
    }
}

// Сохранение имени пользователя (опционально)
function rememberUsername() {
    const usernameInput = document.getElementById('id_username');
    const rememberCheckbox = document.getElementById('remember_me');
    
    if (usernameInput && localStorage.getItem('saved_username')) {
        usernameInput.value = localStorage.getItem('saved_username');
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
    
    if (rememberCheckbox) {
        rememberCheckbox.addEventListener('change', function() {
            if (this.checked && usernameInput.value) {
                localStorage.setItem('saved_username', usernameInput.value);
            } else {
                localStorage.removeItem('saved_username');
            }
        });
    }
}

// Валидация формы перед отправкой
function initLoginValidation() {
    const form = document.querySelector('form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        const username = document.getElementById('id_username');
        const password = document.getElementById('id_password');
        let hasError = false;
        
        // Очищаем предыдущие ошибки
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        
        if (!username.value.trim()) {
            showFieldError(username, 'Введите имя пользователя');
            hasError = true;
        }
        
        if (!password.value.trim()) {
            showFieldError(password, 'Введите пароль');
            hasError = true;
        }
        
        if (hasError) {
            e.preventDefault();
        } else {
            // Показываем индикатор загрузки
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
                submitBtn.disabled = true;
            }
        }
    });
}

// Показать ошибку под полем
function showFieldError(field, message) {
    field.style.borderColor = '#ef4444';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = 'color: #ef4444; font-size: 11px; margin-top: 5px;';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    field.parentNode.appendChild(errorDiv);
    
    field.addEventListener('input', function() {
        field.style.borderColor = '';
        const error = field.parentNode.querySelector('.field-error');
        if (error) error.remove();
    }, { once: true });
}

// Создание частиц для фона
function createLoginParticles() {
    const bg = document.querySelector('.login-bg');
    if (!bg) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = '#b87333';
        particle.style.borderRadius = '50%';
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.bottom = '-20px';
        particle.style.animation = `floatUp ${Math.random() * 10 + 8}s linear infinite`;
        particle.style.animationDelay = Math.random() * 10 + 's';
        bg.appendChild(particle);
    }
    
    // Добавляем стили для анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: 0.5; }
            90% { opacity: 0.5; }
            100% { transform: translateY(-100vh); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    animateLoginForm();
    createLoginParticles();
    initLoginValidation();
    rememberUsername();
});

// Экспорт для глобального использования (для onclick в HTML)
window.togglePassword = togglePassword;