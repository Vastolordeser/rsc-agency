// detail.js - Детальная страница клиента

(function() {
    'use strict';

    function init() {
        animatePage();
        initCopyInfo();
        // initDeleteConfirm() - УДАЛЕН, так как удаление идёт через отдельную страницу confirm_delete.html
    }

    function animatePage() {
        const container = document.querySelector('.client-detail');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            setTimeout(() => {
                container.style.transition = 'all 0.4s ease';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    // Копирование информации
    function initCopyInfo() {
        const infoItems = document.querySelectorAll('.info-item');
        
        infoItems.forEach(item => {
            const value = item.querySelector('.info-value');
            if (!value) return;
            
            const copyBtn = document.createElement('i');
            copyBtn.className = 'fas fa-copy';
            copyBtn.style.cssText = `
                margin-left: 8px;
                cursor: pointer;
                font-size: 12px;
                color: #b87333;
                opacity: 0;
                transition: opacity 0.2s;
            `;
            copyBtn.title = 'Копировать';
            
            value.style.display = 'flex';
            value.style.alignItems = 'center';
            value.style.gap = '5px';
            value.appendChild(copyBtn);
            
            item.addEventListener('mouseenter', () => copyBtn.style.opacity = '1');
            item.addEventListener('mouseleave', () => copyBtn.style.opacity = '0');
            
            copyBtn.addEventListener('click', async () => {
                const text = value.textContent.replace('Копировать', '').trim();
                try {
                    await navigator.clipboard.writeText(text);
                    
                    const original = copyBtn.className;
                    copyBtn.className = 'fas fa-check';
                    setTimeout(() => {
                        copyBtn.className = original;
                    }, 1000);
                } catch (err) {
                    console.error('Ошибка копирования:', err);
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();