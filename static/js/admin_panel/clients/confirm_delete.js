// confirm_delete.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const container = document.querySelector('.delete-container');
        if (container) {
            container.style.opacity = '0';
            setTimeout(() => {
                container.style.transition = 'all 0.3s ease';
                container.style.opacity = '1';
            }, 50);
        }

        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', function() {
                const deleteBtn = document.querySelector('.btn-delete');
                if (deleteBtn) {
                    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Удаление...';
                    deleteBtn.disabled = true;
                }
            });
        }
    });
})();