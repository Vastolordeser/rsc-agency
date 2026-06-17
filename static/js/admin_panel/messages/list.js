// list.js - Скрипты для страницы списка сообщений
(function() {
    'use strict';

    function initMessageFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        if (!filterBtns.length) return;
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                
                const cards = document.querySelectorAll('.message-card');
                cards.forEach(card => {
                    if (filter === 'all' || card.dataset.status === filter) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    function showMessageModal(messageId) {
        fetch('/leads/admin/message/' + messageId + '/json/')
            .then(response => response.json())
            .then(data => {
                document.getElementById('modalName').innerHTML = escapeHtml(data.name);
                document.getElementById('modalEmail').innerHTML = escapeHtml(data.email);
                document.getElementById('modalPhone').innerHTML = escapeHtml(data.phone || 'Не указан');
                document.getElementById('modalDate').innerHTML = data.created_at;
                document.getElementById('modalMessage').innerHTML = data.message.replace(/\n/g, '<br>');
                document.getElementById('messageModal').style.display = 'flex';
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Не удалось загрузить сообщение');
            });
    }

    function closeModal() {
        document.getElementById('messageModal').style.display = 'none';
    }

    function updateMessageStats() {
        const cards = document.querySelectorAll('.message-card');
        let pending = 0, processed = 0;
        cards.forEach(card => {
            if (card.dataset.status === 'pending') pending++;
            else if (card.dataset.status === 'processed') processed++;
        });
        const pendingEl = document.getElementById('pendingCount');
        const processedEl = document.getElementById('processedCount');
        if (pendingEl) pendingEl.innerText = pending;
        if (processedEl) processedEl.innerText = processed;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    document.addEventListener('DOMContentLoaded', function() {
        initMessageFilter();
        updateMessageStats();
        
        // Закрытие модалки по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
        });
        
        // Закрытие по клику вне модалки
        const modal = document.getElementById('messageModal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) closeModal();
            });
        }
    });

    window.showMessageModal = showMessageModal;
    window.closeModal = closeModal;
})();