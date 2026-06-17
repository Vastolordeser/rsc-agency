// edit.js - Редактирование клиента

(function() {
    'use strict';

    let formChanged = false;

    function init() {
        initFormValidation();
        initLeaveConfirm();
        initFieldEffects();
        hideAlerts();
    }

    function initFormValidation() {
        const form = document.querySelector('form');
        if (!form) return;

        const emailField = form.querySelector('[name="email"]');
        
        if (emailField) {
            emailField.addEventListener('input', () => validateEmail(emailField));
            emailField.addEventListener('blur', () => validateEmail(emailField));
        }

        form.addEventListener('submit', (e) => {
            if (emailField && !validateEmail(emailField, true)) {
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
            showToast('Пожалуйста, заполните email корректно', 'error');
        }

        return isValid && email;
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
        const form = document.querySelector('form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea');
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

        const cancelBtn = document.querySelector('.btn-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                if (formChanged && !confirm('Несохраненные изменения будут потеряны. Выйти?')) {
                    e.preventDefault();
                }
            });
        }
    }

    function initFieldEffects() {
        const fields = document.querySelectorAll('.form-group input, .form-group textarea');
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
        const existing = document.querySelector('.client-toast');
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