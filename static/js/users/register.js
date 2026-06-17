// register.js - Скрипты для страницы регистрации

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

// Маска для телефона
function initPhoneMask() {
    const phoneInput = document.getElementById('id_phone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 0) {
            let formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.slice(1, 4);
            if (value.length > 4) formatted += ') ' + value.slice(4, 7);
            if (value.length > 7) formatted += '-' + value.slice(7, 9);
            if (value.length > 9) formatted += '-' + value.slice(9, 11);
            e.target.value = formatted;
        } else {
            e.target.value = '';
        }
    });
}

// Валидация формы регистрации
function initRegisterValidation() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        const username = document.getElementById('id_username');
        const email = document.getElementById('id_email');
        const phone = document.getElementById('id_phone');
        const password1 = document.getElementById('id_password1');
        const password2 = document.getElementById('id_password2');
        let hasError = false;
        
        // Очищаем предыдущие ошибки
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        document.querySelectorAll('.form-control').forEach(el => el.style.borderColor = '');
        
        // Валидация логина
        if (!username.value.trim()) {
            showFieldError(username, 'Введите логин');
            hasError = true;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username.value)) {
            showFieldError(username, 'Логин может содержать только латиницу, цифры и подчеркивание');
            hasError = true;
        }
        
        // Валидация email
        if (!email.value.trim()) {
            showFieldError(email, 'Введите email');
            hasError = true;
        } else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email.value)) {
            showFieldError(email, 'Введите корректный email');
            hasError = true;
        }
        
        // Валидация телефона
        if (!phone.value.trim()) {
            showFieldError(phone, 'Введите телефон');
            hasError = true;
        } else if (phone.value.replace(/\D/g, '').length < 11) {
            showFieldError(phone, 'Введите полный номер телефона');
            hasError = true;
        }
        
        // Валидация пароля
        if (!password1.value) {
            showFieldError(password1, 'Введите пароль');
            hasError = true;
        } else if (password1.value.length < 4) {
            showFieldError(password1, 'Пароль должен содержать минимум 4 символа');
            hasError = true;
        }
        
        // Проверка совпадения паролей
        if (password2.value && password1.value !== password2.value) {
            showFieldError(password2, 'Пароли не совпадают');
            hasError = true;
        }
        
        if (hasError) {
            e.preventDefault();
        } else {
            // Показываем индикатор загрузки
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
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

// Проверка сложности пароля в реальном времени
function initPasswordStrength() {
    const passwordInput = document.getElementById('id_password1');
    if (!passwordInput) return;
    
    const strengthIndicator = document.createElement('div');
    strengthIndicator.className = 'password-strength';
    strengthIndicator.style.cssText = 'margin-top: 5px; font-size: 11px;';
    passwordInput.parentNode.appendChild(strengthIndicator);
    
    passwordInput.addEventListener('input', function() {
        const value = this.value;
        let strength = 0;
        let strengthText = '';
        let strengthColor = '';
        
        if (value.length >= 8) strength++;
        if (value.length >= 12) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/[0-9]/.test(value)) strength++;
        if (/[^A-Za-z0-9]/.test(value)) strength++;
        
        if (value.length === 0) {
            strengthText = '';
        } else if (strength <= 1) {
            strengthText = 'Слабый пароль';
            strengthColor = '#ef4444';
        } else if (strength <= 3) {
            strengthText = 'Средний пароль';
            strengthColor = '#f59e0b';
        } else {
            strengthText = 'Надёжный пароль';
            strengthColor = '#10b981';
        }
        
        strengthIndicator.innerHTML = strengthText ? `<i class="fas fa-shield-alt"></i> ${strengthText}` : '';
        strengthIndicator.style.color = strengthColor;
    });
}

// Анимация появления элементов
function animateRegisterForm() {
    const container = document.querySelector('.register-container');
    const visual = document.querySelector('.register-visual');
    const formCard = document.querySelector('.register-form-card');
    
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

// Создание частиц для фона
function createRegisterParticles() {
    const bg = document.querySelector('.register-bg');
    if (!bg) return;
    
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 5 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = '#b87333';
        particle.style.borderRadius = '50%';
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.bottom = '-20px';
        particle.style.animation = `floatUp ${Math.random() * 12 + 10}s linear infinite`;
        particle.style.animationDelay = Math.random() * 10 + 's';
        bg.appendChild(particle);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    animateRegisterForm();
    createRegisterParticles();
    initPhoneMask();
    initRegisterValidation();
    initPasswordStrength();
});

// Экспорт для глобального использования
window.togglePassword = togglePassword;