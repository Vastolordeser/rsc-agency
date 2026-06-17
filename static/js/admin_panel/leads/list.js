// list.js - Список заявок

(function() {
    'use strict';

    let currentFilter = 'all';
    let searchQuery = '';
    let refreshInterval = null;

    // Обновление статистики
    async function updateStats() {
        try {
            const response = await fetch('/leads/admin/leads/stats/');
            const data = await response.json();
            
            document.getElementById('statAll').innerText = data.all || 0;
            document.getElementById('statNew').innerText = data.new || 0;
            document.getElementById('statProcessing').innerText = data.processing || 0;
            document.getElementById('statCompleted').innerText = data.completed || 0;
            document.getElementById('statRejected').innerText = data.rejected || 0;
        } catch(e) {
            console.error('Stats error:', e);
        }
    }

    // Фильтрация карточек
    function filterLeads() {
        const cards = document.querySelectorAll('.lead-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const status = card.dataset.status;
            const login = (card.dataset.login || '').toLowerCase();
            const name = (card.dataset.name || '').toLowerCase();
            const email = (card.dataset.email || '').toLowerCase();
            const phone = card.dataset.phone || '';
            
            const statusMatch = currentFilter === 'all' || status === currentFilter;
            const searchMatch = !searchQuery || 
                login.includes(searchQuery) || 
                name.includes(searchQuery) || 
                email.includes(searchQuery) || 
                phone.includes(searchQuery);
            
            if (statusMatch && searchMatch) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Показываем сообщение если ничего не найдено
        showEmptyMessage(visibleCount === 0 && cards.length > 0);
    }
    
    function showEmptyMessage(show) {
        let emptyMsg = document.querySelector('.filter-empty-message');
        if (show && !emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.className = 'filter-empty-message';
            emptyMsg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 50px; color: #b0b0b0;';
            emptyMsg.innerHTML = '<i class="fas fa-search" style="font-size: 48px; opacity: 0.3;"></i><p>Ничего не найдено</p>';
            document.getElementById('leadsGrid')?.appendChild(emptyMsg);
        } else if (!show && emptyMsg) {
            emptyMsg.remove();
        }
    }

    // Поиск
    function initSearch() {
        const input = document.getElementById('searchInput');
        if (input) {
            input.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase();
                filterLeads();
            });
        }
    }

    // Фильтры
    function initFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                filterLeads();
            });
        });
    }

    // Клик по статистике
    function initStatsClick() {
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => {
                const status = card.dataset.status;
                const filterBtn = document.querySelector(`.filter-btn[data-filter="${status}"]`);
                if (filterBtn) filterBtn.click();
            });
        });
    }

    // Клик по карточке
    function initCardClick() {
        document.querySelectorAll('.lead-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.status-change, .btn-delete, a')) {
                    const id = card.dataset.id;
                    if (id) window.location.href = `/leads/admin/lead/${id}/view/`;
                }
            });
        });
    }

    // Экспорт
    window.exportLeads = function() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) loading.classList.add('active');
        window.location.href = '/leads/admin/leads/export/';
        setTimeout(() => {
            if (loading) loading.classList.remove('active');
        }, 2000);
    };

    // Автообновление
    function initAutoRefresh() {
        const container = document.querySelector('.leads-container');
        if (!container) return;
        
        // Обновляем статистику каждые 30 секунд
        refreshInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                updateStats();
            }
        }, 30000);
    }

    // Анимация карточек
    function initAnimations() {
        document.querySelectorAll('.lead-card').forEach((card, i) => {
            card.style.animationDelay = `${i * 0.03}s`;
        });
    }

    // Инициализация
    document.addEventListener('DOMContentLoaded', () => {
        updateStats();
        initSearch();
        initFilters();
        initStatsClick();
        initCardClick();
        initAutoRefresh();
        initAnimations();
        
        // Отложенный фильтр после загрузки всех данных
        setTimeout(filterLeads, 100);
    });
})();