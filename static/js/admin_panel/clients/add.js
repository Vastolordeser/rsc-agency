// add.js - Добавление клиента

(function() {
    'use strict';

    function init() {
        initAvatarPreview();
        initFormValidation();
        initPasswordMatch();
    }

    // Превью аватара
    function initAvatarPreview() {
        const avatarInput = document.getElementById('avatarInput');
        const preview = document.getElementById('avatarPreview');
        
        if (avatarInput && preview) {
            avatarInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        preview.innerHTML = `<img src="${event.target.result}" alt="Avatar">`;
                    };
                    reader.readAsDataURL(file);
                } else {
                    preview.innerHTML = '<i class="fas fa-user-circle"></i>';
                }
            });
        }
    }

    // Валидация формы
    function initFormValidation() {
        const form = document.querySelector('form');
        if (!form) return;

        const emailField = form.querySelector('[name="email"]');
        const phoneField = form.querySelector('[name="phone"]');
        const passwordField = form.querySelector('[name="password"]');
        const password2Field = form.querySelector('[name="password2"]');

        if (emailField) {
            emailField.addEventListener('blur', () => validateEmail(emailField));
        }

        if (phoneField) {
            phoneField.addEventListener('input', () => validatePhone(phoneField));
        }

        form.addEventListener('submit', (e) => {
            let isValid = true;

            if (emailField && !validateEmail(emailField)) isValid = false;
            if (phoneField && !validatePhone(phoneField)) isValid = false;
            
            if (passwordField && password2Field && passwordField.value !== password2Field.value) {
                showFieldError(password2Field, 'Пароли не совпадают');
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
                btn.disabled = true;
            }
        });
    }

    function validateEmail(field) {
        const email = field.value.trim();
        const isValid = email && /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email);

        if (!isValid && email) {
            showFieldError(field, 'Введите корректный email');
        } else if (!email) {
            showFieldError(field, 'Email обязателен');
        } else {
            clearFieldError(field);
        }

        return isValid && email;
    }

    function validatePhone(field) {
        const phone = field.value.trim();
        const isValid = phone && phone.length >= 10;

        if (!isValid && phone) {
            showFieldError(field, 'Введите корректный телефон');
        } else if (!phone) {
            showFieldError(field, 'Телефон обязателен');
        } else {
            clearFieldError(field);
        }

        return isValid && phone;
    }

    function showFieldError(field, message) {
        field.style.borderColor = '#ef4444';
        let errorDiv = field.parentElement?.querySelector('.field-error');
        if (!errorDiv && field.parentElement) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.cssText = 'color: #ef4444; font-size: 11px; margin-top: 5px;';
            field.parentElement.appendChild(errorDiv);
        }
        if (errorDiv) errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    }

    function clearFieldError(field) {
        field.style.borderColor = '';
        field.parentElement?.querySelector('.field-error')?.remove();
    }

    // Проверка совпадения паролей в реальном времени
    function initPasswordMatch() {
        const password = document.querySelector('[name="password"]');
        const password2 = document.querySelector('[name="password2"]');
        
        if (password && password2) {
            password2.addEventListener('input', () => {
                if (password.value !== password2.value && password2.value) {
                    showFieldError(password2, 'Пароли не совпадают');
                } else {
                    clearFieldError(password2);
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();