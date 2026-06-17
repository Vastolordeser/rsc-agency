// add.js - Создание новой заявки

(function() {
    'use strict';

    // Валидация формы
    function initFormValidation() {
        const form = document.querySelector('form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            const name = form.querySelector('[name="name"]');
            const email = form.querySelector('[name="email"]');
            const phone = form.querySelector('[name="phone"]');
            
            let hasError = false;
            
            if (!name.value.trim()) {
                showError(name, 'Введите имя');
                hasError = true;
            }
            
            if (!email.value.trim() || !isValidEmail(email.value)) {
                showError(email, 'Введите корректный email');
                hasError = true;
            }
            
            if (!phone.value.trim()) {
                showError(phone, 'Введите телефон');
                hasError = true;
            }
            
            if (hasError) {
                e.preventDefault();
                return;
            }
            
            // Показываем загрузку
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
                btn.disabled = true;
            }
        });
        
        // Убираем ошибки при вводе
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => {
                field.style.borderColor = '';
                const hint = field.parentElement?.querySelector('.error-hint');
                if (hint) hint.remove();
            });
        });
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email);
    }
    
    function showError(field, message) {
        field.style.borderColor = '#ef4444';
        
        let hint = field.parentElement?.querySelector('.error-hint');
        if (!hint && field.parentElement) {
            hint = document.createElement('div');
            hint.className = 'error-hint';
            hint.style.cssText = 'color: #ef4444; font-size: 11px; margin-top: 5px;';
            field.parentElement.appendChild(hint);
        }
        if (hint) hint.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        field.focus();
    }
    
    // Анимация полей
    function initFieldEffects() {
        const fields = document.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.addEventListener('focus', () => {
                field.style.transform = 'scale(1.01)';
                field.style.transition = 'all 0.2s';
            });
            field.addEventListener('blur', () => {
                field.style.transform = '';
            });
        });
    }
    
    // Автоформат телефона
    function initPhoneFormat() {
        const phoneInput = document.querySelector('[name="phone"]');
        if (!phoneInput) return;
        
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 0 && !value.startsWith('7') && !value.startsWith('8')) {
                value = '7' + value;
            }
            e.target.value = value;
        });
    }
    
    // Инициализация
    document.addEventListener('DOMContentLoaded', () => {
        initFormValidation();
        initFieldEffects();
        initPhoneFormat();
    });
})();