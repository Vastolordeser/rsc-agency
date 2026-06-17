// confirm_delete.js - Подтверждение удаления сотрудника (БЕЗ confirm)

(function() {
    'use strict';

    function init() {
        animatePage();
        initDeleteConfirm();
    }

    function animatePage() {
        const container = document.querySelector('.delete-container');
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

    function initDeleteConfirm() {
        const form = document.querySelector('form');
        const deleteBtn = document.querySelector('.btn-delete');

        if (!form || !deleteBtn) return;

        let isProcessing = false;

        deleteBtn.addEventListener('click', (e) => {
            if (isProcessing) {
                e.preventDefault();
                return;
            }

            isProcessing = true;
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Удаление...';
            deleteBtn.disabled = true;
            // Форма отправится сама, кнопка type="submit"
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();