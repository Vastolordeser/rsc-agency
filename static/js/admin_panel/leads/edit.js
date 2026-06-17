// edit.js - Редактирование заявки

(function() {
    'use strict';

    let formChanged = false;

    function init() {
        initFormValidation();
        initLeaveConfirm();
        initFieldEffects();
        initPhoneMask();
        hideAlerts();
    }

    function initFormValidation() {
        const form = document.getElementById('editForm');
        if (!form) return;

        const emailField = form.querySelector('[name="email"]');
        const phoneField = form.querySelector('[name="phone"]');

        if (emailField) {
            emailField.addEventListener('input', () => validateEmail(emailField));
            emailField.addEventListener('blur', () => validateEmail(emailField));
        }

        if (phoneField) {
            phoneField.addEventListener('input', () => validatePhone(phoneField));
        }

        form.addEventListener('submit', (e) => {
            let isValid = true;
            if (emailField && !validateEmail(emailField, true)) isValid = false;
            if (phoneField && !validatePhone(phoneField, true)) isValid = false;

            if (!isValid) {
                e.preventDefault();
                return;
            }

            const btn = e.submitter;
            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
                btn.disabled = true;
            }
        });
    }

    function validateEmail(field, showAlert = false) {
        const email = field.value.trim();
        const isValid = email && /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email);

        if (!isValid && email) {
            showFieldError(field, 'Введите корректный email');
        } else if (!email) {
            showFieldError(field, 'Email обязателен');
        } else {
            clearFieldError(field);
        }

        if (showAlert && !isValid && email) {
            showToast('Пожалуйста, заполните все поля корректно', 'error');
        }

        return isValid && email;
    }

    function validatePhone(field, showAlert = false) {
        const phone = field.value.trim();
        const isValid = phone && phone.length >= 10;

        if (!isValid && phone) {
            showFieldError(field, 'Введите корректный телефон (минимум 10 цифр)');
        } else if (!phone) {
            showFieldError(field, 'Телефон обязателен');
        } else {
            clearFieldError(field);
        }

        if (showAlert && !isValid && phone) {
            showToast('Пожалуйста, заполните все поля корректно', 'error');
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

    function initLeaveConfirm() {
        const form = document.getElementById('editForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (!input.readOnly) {
                input.addEventListener('change', () => formChanged = true);
                input.addEventListener('input', () => formChanged = true);
            }
        });

        window.addEventListener('beforeunload', (e) => {
            if (formChanged) {
                e.preventDefault();
                e.returnValue = 'У вас есть несохраненные изменения. Вы уверены?';
                return e.returnValue;
            }
        });

        document.querySelectorAll('.btn-cancel').forEach(link => {
            link.addEventListener('click', (e) => {
                if (formChanged && !confirm('Несохраненные изменения будут потеряны. Выйти?')) {
                    e.preventDefault();
                }
            });
        });
    }

    function initFieldEffects() {
        const fields = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
        fields.forEach(field => {
            field.addEventListener('focus', () => {
                field.style.transform = 'scale(1.01)';
                field.style.transition = 'all 0.2s';
                const label = field.parentElement?.querySelector('label');
                if (label) label.style.color = '#b87333';
            });
            field.addEventListener('blur', () => {
                field.style.transform = '';
                const label = field.parentElement?.querySelector('label');
                if (label && !field.value) label.style.color = '';
                else if (label) label.style.color = '#b0b0b0';
            });
        });
    }

    function initPhoneMask() {
        const phoneField = document.querySelector('[name="phone"]');
        if (!phoneField) return;

        phoneField.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 0 && !value.startsWith('7') && !value.startsWith('8')) {
                value = '7' + value;
            }
            e.target.value = value;
        });
    }

    function hideAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            setTimeout(() => {
                alert.style.opacity = '0';
                alert.style.transition = 'opacity 0.3s';
                setTimeout(() => alert.remove(), 300);
            }, 4000);
        });
    }

    function showToast(message, type = 'error') {
        const existing = document.querySelector('.edit-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        const colors = { error: '#ef4444', success: '#10b981' };
        toast.style.cssText = `
            position: fixed; bottom: 30px; right: 30px;
            background: ${colors[type]}; color: white;
            padding: 12px 24px; border-radius: 50px;
            font-size: 14px; z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        toast.innerHTML = `<i class="fas fa-${type === 'error' ? 'times-circle' : 'check-circle'}"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    document.addEventListener('DOMContentLoaded', init);
})();