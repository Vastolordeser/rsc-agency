// list.js - Скрипты для страницы списка проектов (ИСПРАВЛЕН)

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let allClients = new Set();

// ========== СБОР КЛИЕНТОВ ==========
function collectClients() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        const client = card.dataset.client;
        if (client && client !== 'не указан' && client !== '') {
            allClients.add(client);
        }
    });
    
    const clientSelect = document.getElementById('clientFilter');
    if (clientSelect) {
        while (clientSelect.options.length > 1) {
            clientSelect.remove(1);
        }
        const sortedClients = Array.from(allClients).sort();
        sortedClients.forEach(client => {
            const option = document.createElement('option');
            option.value = client;
            option.textContent = client.charAt(0).toUpperCase() + client.slice(1);
            clientSelect.appendChild(option);
        });
    }
}

// ========== ФИЛЬТРАЦИЯ ==========
function filterProjects() {
    const searchInput = document.getElementById('searchInput');
    const clientFilter = document.getElementById('clientFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const client = clientFilter ? clientFilter.value : 'all';
    const status = statusFilter ? statusFilter.value : 'all';
    
    const cards = document.querySelectorAll('.project-card');
    let visibleCount = 0;
    let activeCount = 0;
    let inactiveCount = 0;
    
    cards.forEach(card => {
        const name = card.dataset.name || '';
        const cardClient = card.dataset.client || '';
        const isActive = card.dataset.active === 'true';
        
        let match = true;
        
        // Поиск по названию
        if (search) {
            match = match && name.includes(search);
        }
        
        // Фильтр по клиенту
        if (client !== 'all') {
            match = match && (cardClient === client);
        }
        
        // Фильтр по статусу
        if (status !== 'all') {
            if (status === 'active') {
                match = match && isActive;
            } else if (status === 'inactive') {
                match = match && !isActive;
            }
        }
        
        // Применяем отображение
        if (match) {
            card.style.display = '';
            visibleCount++;
            if (isActive) activeCount++;
            else inactiveCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    const totalCountEl = document.getElementById('totalCount');
    const activeCountEl = document.getElementById('activeCount');
    const inactiveCountEl = document.getElementById('inactiveCount');
    
    if (totalCountEl) totalCountEl.textContent = visibleCount;
    if (activeCountEl) activeCountEl.textContent = activeCount;
    if (inactiveCountEl) inactiveCountEl.textContent = inactiveCount;
    
    // Показываем сообщение, если нет результатов
    const grid = document.getElementById('projectsGrid');
    const emptyMessage = document.querySelector('.empty-filter-message');
    
    if (visibleCount === 0 && cards.length > 0) {
        if (!emptyMessage) {
            const msg = document.createElement('div');
            msg.className = 'empty-filter-message';
            msg.style.cssText = 'text-align: center; padding: 40px; color: #b0b0b0; grid-column: 1/-1;';
            msg.innerHTML = '<i class="fas fa-search" style="font-size: 48px; opacity: 0.5; margin-bottom: 15px; display: block;"></i>Ничего не найдено';
            grid.appendChild(msg);
        }
    } else {
        if (emptyMessage) emptyMessage.remove();
    }
}

// ========== СБРОС ФИЛЬТРОВ ==========
function initClearFilters() {
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('searchInput');
            const clientFilter = document.getElementById('clientFilter');
            const statusFilter = document.getElementById('statusFilter');
            
            if (searchInput) searchInput.value = '';
            if (clientFilter) clientFilter.value = 'all';
            if (statusFilter) statusFilter.value = 'all';
            
            filterProjects();
        });
    }
}

// ========== СТАТИСТИКА КЛИКАБЕЛЬНАЯ ==========
function initStatsClick() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            const filter = this.dataset.filter;
            const statusFilter = document.getElementById('statusFilter');
            if (statusFilter) {
                statusFilter.value = filter;
                filterProjects();
            }
        });
    });
}

// ========== ПЕРЕКЛЮЧЕНИЕ СТАТУСА ==========
async function toggleProject(id, isActive) {
    const btn = document.querySelector(`.project-card[data-id="${id}"] .btn-toggle`);
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    
    try {
        const response = await fetch(`/leads/admin/project/${id}/toggle/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        if (data.success) {
            const card = document.querySelector(`.project-card[data-id="${id}"]`);
            const newIsActive = data.is_active;
            
            card.dataset.active = newIsActive;
            
            const statusEl = card.querySelector('.project-status');
            if (newIsActive) {
                statusEl.className = 'project-status status-active';
                statusEl.textContent = 'Активен';
            } else {
                statusEl.className = 'project-status status-inactive';
                statusEl.textContent = 'Неактивен';
            }
            
            const toggleBtn = card.querySelector('.btn-toggle');
            toggleBtn.innerHTML = `<i class="fas fa-power-off"></i> ${newIsActive ? 'Выкл' : 'Вкл'}`;
            toggleBtn.disabled = false;
            toggleBtn.setAttribute('onclick', `toggleProject(${id}, ${newIsActive})`);
            
            filterProjects();
            
            showToast(newIsActive ? '✅ Проект активирован' : '⛔ Проект деактивирован');
        } else {
            btn.innerHTML = originalText;
            btn.disabled = false;
            showToast('❌ Ошибка при изменении статуса', true);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        btn.innerHTML = originalText;
        btn.disabled = false;
        showToast('❌ Ошибка сети', true);
    }
}

// ========== УДАЛЕНИЕ ПРОЕКТА ==========
function deleteProject(id, name) {
    window.location.href = `/leads/admin/project/${id}/delete/`;
}

// ========== TOAST ==========
function showToast(message, isError = false) {
    let toast = document.querySelector('.custom-toast');
    if (toast) toast.remove();
    
    toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${isError ? '#ef4444' : '#10b981'};
        color: white;
        border-radius: 12px;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== GET COOKIE ==========
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    collectClients();
    filterProjects();
    initClearFilters();
    initStatsClick();
    
    const searchInput = document.getElementById('searchInput');
    const clientFilter = document.getElementById('clientFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) searchInput.addEventListener('input', filterProjects);
    if (clientFilter) clientFilter.addEventListener('change', filterProjects);
    if (statusFilter) statusFilter.addEventListener('change', filterProjects);
});

// Экспорт
window.toggleProject = toggleProject;
window.deleteProject = deleteProject;
window.filterProjects = filterProjects;