// form.js - Общие функции для форм клиента (если нужны)

(function() {
    'use strict';

    // Общая функция для телефона
    window.formatPhone = function(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 0 && !value.startsWith('7') && !value.startsWith('8')) {
            value = '7' + value;
        }
        input.value = value;
    };

    // Общая функция для показа toast
    window.showClientToast = function(message, isError = false) {
        let toast = document.querySelector('.client-global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'client-global-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                padding: 12px 24px;
                border-radius: 50px;
                color: white;
                font-size: 14px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(toast);
        }
        
        toast.style.background = isError ? '#ef4444' : 'linear-gradient(135deg, #b87333, #e8a05e)';
        toast.innerHTML = `<i class="fas fa-${isError ? 'times-circle' : 'check-circle'}"></i> ${message}`;
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '10px';
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.style.display = 'none';
                toast.style.opacity = '1';
            }, 300);
        }, 3000);
    };
})();