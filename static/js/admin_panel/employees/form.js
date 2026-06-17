// form.js - Добавление/редактирование сотрудника (БЕЗ УВЕДОМЛЕНИЯ О ЗАКРЫТИИ)

(function() {
    'use strict';

    let isSubmitting = false;

    function init() {
        initPasswordToggles();
        initAvatarPreview();
        initPasswordMatchLive();
        initFormValidation();
        // resetFormDirtyState() - УДАЛЕНО
    }

    function initPasswordToggles() {
        const toggle1 = document.getElementById('togglePassword');
        const toggle2 = document.getElementById('togglePassword2');
        const password1 = document.getElementById('password');
        const password2 = document.getElementById('password2');

        if (toggle1 && password1) {
            toggle1.addEventListener('click', function() {
                const type = password1.type === 'password' ? 'text' : 'password';
                password1.type = type;
                this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            });
        }

        if (toggle2 && password2) {
            toggle2.addEventListener('click', function() {
                const type = password2.type === 'password' ? 'text' : 'password';
                password2.type = type;
                this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            });
        }
    }

    function initAvatarPreview() {
        const input = document.getElementById('avatarInput');
        const preview = document.getElementById('avatarPreview');
        
        if (input) {
            input.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="preview" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #b87333;">`;
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }
    }

    function initPasswordMatchLive() {
        const password = document.getElementById('password');
        const password2 = document.getElementById('password2');
        const errorDiv = document.getElementById('password-error');

        if (!password || !password2) return;

        function checkMatch() {
            if (password2.value && password.value !== password2.value) {
                password2.style.borderColor = '#ef4444';
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Пароли не совпадают';
                return false;
            } else {
                password2.style.borderColor = '';
                errorDiv.style.display = 'none';
                errorDiv.innerHTML = '';
                return true;
            }
        }

        password2.addEventListener('input', checkMatch);
        password2.addEventListener('blur', checkMatch);
    }

    function validateForm() {
        let isValid = true;
        const username = document.getElementById('username');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const password2 = document.getElementById('password2');
        const usernameError = document.getElementById('username-error');
        const emailError = document.getElementById('email-error');
        const passwordError = document.getElementById('password-error');
        
        const isEditMode = document.getElementById('password').placeholder ? true : false;

        if (!username.value.trim()) {
            usernameError.style.display = 'block';
            usernameError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Введите логин';
            username.style.borderColor = '#ef4444';
            isValid = false;
        } else if (username.value.length < 3) {
            usernameError.style.display = 'block';
            usernameError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Логин должен быть минимум 3 символа';
            username.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            usernameError.style.display = 'none';
            username.style.borderColor = '';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            emailError.style.display = 'block';
            emailError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Введите email';
            email.style.borderColor = '#ef4444';
            isValid = false;
        } else if (!emailRegex.test(email.value)) {
            emailError.style.display = 'block';
            emailError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Введите корректный email';
            email.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            emailError.style.display = 'none';
            email.style.borderColor = '';
        }

        if (password.value && password.value !== password2.value) {
            passwordError.style.display = 'block';
            passwordError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Пароли не совпадают';
            password2.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            passwordError.style.display = 'none';
            password.style.borderColor = '';
            password2.style.borderColor = '';
        }

        return isValid;
    }

    function initFormValidation() {
        const form = document.getElementById('employeeForm');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                if (!validateForm()) {
                    e.preventDefault();
                    return;
                }
                
                if (!isSubmitting) {
                    isSubmitting = true;
                    const btn = form.querySelector('button[type="submit"]');
                    if (btn) {
                        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
                        btn.disabled = true;
                    }
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();