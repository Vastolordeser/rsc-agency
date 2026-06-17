// detail.js - Скрипты для детальной страницы сообщения
(function() {
    'use strict';

    function animateDetailPage() {
        const container = document.querySelector('.detail-container');
        if (container) {
            container.style.opacity = '0';
            setTimeout(() => {
                container.style.transition = 'all 0.5s ease';
                container.style.opacity = '1';
            }, 50);
        }
    }

    function copyToClipboard(text, fieldName) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`✅ ${fieldName} скопирован`);
        }).catch(() => {
            showToast('❌ Ошибка копирования', true);
        });
    }

    function showToast(message, isError = false) {
        let toast = document.querySelector('.custom-toast');
        if (toast) toast.remove();
        
        toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            padding: 12px 24px; background: ${isError ? '#ef4444' : '#10b981'};
            color: white; border-radius: 12px; font-size: 14px;
            z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function addCopyButton(container, text, label) {
        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.style.cssText = `background:none; border:none; color:#b87333; cursor:pointer; margin-left:10px; font-size:12px;`;
        copyBtn.onclick = () => copyToClipboard(text, label);
        container.appendChild(copyBtn);
    }

    document.addEventListener('DOMContentLoaded', function() {
        animateDetailPage();
        
        const nameValue = document.querySelector('.info-row:first-child .info-value');
        const emailValue = document.querySelector('.info-row:nth-child(2) .info-value');
        const messageText = document.querySelector('.message-text');
        
        if (nameValue && nameValue.innerText) addCopyButton(nameValue, nameValue.innerText, 'Имя');
        if (emailValue && emailValue.innerText) addCopyButton(emailValue, emailValue.innerText, 'Email');
        if (messageText && messageText.innerText) addCopyButton(messageText, messageText.innerText, 'Сообщение');
    });
})();