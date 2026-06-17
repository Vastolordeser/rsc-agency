// list.js - Список клиентов

(function() {
    'use strict';

    let currentFilter = 'all';
    let searchQuery = '';

    function init() {
        createParticles();
        initStatsCards();
        initFilters();
        initSearch();
        initCardAnimations();
        updateStatsCounters();
    }

    // Создание частиц фона
    function createParticles() {
        const container = document.getElementById('particlesContainer');
        if (!container) return;
        
        for (let i = 0; i < 60; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = 10 + Math.random() * 10 + 's';
            particle.style.width = (Math.random() * 6 + 2) + 'px';
            particle.style.height = particle.style.width;
            container.appendChild(particle);
        }
    }

    // Карточки статистики
    function initStatsCards() {
        const statsCards = document.querySelectorAll('.stat-card');
        statsCards.forEach(card => {
            card.addEventListener('click', () => {
                const status = card.dataset.status;
                const filterBtn = document.querySelector(`.status-btn[data-filter="${status}"]`);
                if (filterBtn) filterBtn.click();
            });
        });
    }

    // Фильтры
    function initFilters() {
        const filterBtns = document.querySelectorAll('.status-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                filterCards();
            });
        });
    }

    // Поиск
    function initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase();
                filterCards();
            });
        }
    }

    // Фильтрация карточек
    function filterCards() {
        const cards = document.querySelectorAll('.client-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const status = card.dataset.status;
            const name = card.dataset.name || '';
            const email = card.dataset.email || '';
            const phone = card.dataset.phone || '';
            const company = card.dataset.company || '';
            
            const statusMatch = currentFilter === 'all' || status === currentFilter;
            const searchMatch = !searchQuery || 
                name.includes(searchQuery) || 
                email.includes(searchQuery) || 
                phone.includes(searchQuery) || 
                company.includes(searchQuery);
            
            if (statusMatch && searchMatch) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        updateStatsCounters();
        showEmptyMessage(visibleCount === 0 && cards.length > 0);
    }

    function showEmptyMessage(show) {
        let emptyMsg = document.querySelector('.filter-empty-msg');
        const grid = document.getElementById('clientsGrid');
        
        if (show && !emptyMsg && grid) {
            emptyMsg = document.createElement('div');
            emptyMsg.className = 'filter-empty-msg empty-state';
            emptyMsg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 60px;';
            emptyMsg.innerHTML = '<i class="fas fa-search" style="font-size: 48px; opacity: 0.3;"></i><h3>Ничего не найдено</h3><p>Попробуйте изменить критерии поиска</p>';
            grid.appendChild(emptyMsg);
        } else if (!show && emptyMsg) {
            emptyMsg.remove();
        }
    }

    // Обновление счетчиков статистики
    function updateStatsCounters() {
        let online = 0, offline = 0, inactive = 0, blocked = 0;
        const cards = document.querySelectorAll('.client-card');
        
        cards.forEach(card => {
            if (card.style.display !== 'none') {
                const status = card.dataset.status;
                if (status === 'online') online++;
                else if (status === 'offline') offline++;
                else if (status === 'inactive') inactive++;
                else if (status === 'blocked') blocked++;
            }
        });
        
        const onlineEl = document.getElementById('onlineCount');
        const offlineEl = document.getElementById('offlineCount');
        const inactiveEl = document.getElementById('inactiveCount');
        const blockedEl = document.getElementById('blockedCount');
        
        if (onlineEl) onlineEl.innerText = online;
        if (offlineEl) offlineEl.innerText = offline;
        if (inactiveEl) inactiveEl.innerText = inactive;
        if (blockedEl) blockedEl.innerText = blocked;
    }

    // Анимация появления карточек
    function initCardAnimations() {
        const cards = document.querySelectorAll('.client-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = (index * 0.03) + 's';
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.opacity = '1';
            }, index * 30);
        });
    }

    // initConfirmDialogs - ПОЛНОСТЬЮ УДАЛЕНА
    
    document.addEventListener('DOMContentLoaded', () => {
        init();
        // initConfirmDialogs(); - ЗАКОММЕНТИРОВАН
    });
})();