// list.js - Скрипты для страницы списка проектов (без confirm)

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let allClients = new Set();

// ========== СБОР КЛИЕНТОВ ДЛЯ ФИЛЬТРА ==========
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
        allClients.forEach(client => {
            const option = document.createElement('option');
            option.value = client;
            option.textContent = client.charAt(0).toUpperCase() + client.slice(1);
            clientSelect.appendChild(option);
        });
    }
}

// ========== ФИЛЬТРАЦИЯ ПРОЕКТОВ ==========
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
        
        let match = name.includes(search);
        if (client !== 'all') {
            match = match && (cardClient === client);
        }
        if (status !== 'all') {
            match = match && ((status === 'active' && isActive) || (status === 'inactive' && !isActive));
        }
        
        card.style.display = match ? '' : 'none';
        if (match) {
            visibleCount++;
            if (isActive) activeCount++;
            else inactiveCount++;
        }
    });
    
    const totalCountEl = document.getElementById('totalCount');
    const activeCountEl = document.getElementById('activeCount');
    const inactiveCountEl = document.getElementById('inactiveCount');
    
    if (totalCountEl) totalCountEl.textContent = visibleCount;
    if (activeCountEl) activeCountEl.textContent = activeCount;
    if (inactiveCountEl) inactiveCountEl.textContent = inactiveCount;
    
    const emptyMessage = document.querySelector('.filter-empty-message');
    if (visibleCount === 0 && cards.length > 0) {
        if (!emptyMessage) {
            const msg = document.createElement('div');
            msg.className = 'filter-empty-message empty-state';
            msg.innerHTML = '<i class="fas fa-search"></i><h3>Ничего не найдено</h3><p>Попробуйте изменить параметры фильтрации</p>';
            document.getElementById('projectsGrid')?.appendChild(msg);
        }
    } else if (emptyMessage) {
        emptyMessage.remove();
    }
}

// ========== СБРОС ФИЛЬТРОВ ==========
function initClearFilters() {
    const clearBtn = document.getElementById('clearFilters');
    if (!clearBtn) return;
    
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

// ========== СТАТИСТИКА КЛИКАБЕЛЬНАЯ ==========
function initStatsClick() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            const filter = this.dataset.filter;
            const statusFilter = document.getElementById('statusFilter');
            if (statusFilter) {
                if (filter === 'all') {
                    statusFilter.value = 'all';
                } else if (filter === 'active') {
                    statusFilter.value = 'active';
                } else if (filter === 'inactive') {
                    statusFilter.value = 'inactive';
                }
                filterProjects();
            }
        });
    });
}

// ========== ПЕРЕКЛЮЧЕНИЕ СТАТУСА ПРОЕКТА (МОДАЛЬНОЕ ОКНО) ==========
async function toggleProject(id, isActive) {
    const action = isActive ? 'деактивировать' : 'активировать';
    const actionText = isActive ? 'Деактивировать' : 'Активировать';
    
    showModal({
        title: `${actionText} проект`,
        message: `Вы уверены, что хотите ${action} этот проект?`,
        icon: 'question',
        confirmText: `Да, ${actionText}`,
        cancelText: 'Отмена',
        onConfirm: async () => {
            showLoading(true);
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
                    showToast(data.is_active ? '✅ Проект активирован' : '⛔ Проект деактивирован');
                    setTimeout(() => location.reload(), 500);
                } else {
                    showToast('❌ Ошибка при изменении статуса', true);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showToast('❌ Ошибка сети. Проверьте соединение.', true);
            } finally {
                showLoading(false);
            }
        }
    });
}

// ========== УДАЛЕНИЕ ПРОЕКТА (МОДАЛЬНОЕ ОКНО) ==========
function deleteProject(id, name) {
    showModal({
        title: 'Удаление проекта',
        message: `Вы уверены, что хотите удалить проект "<strong>${escapeHtml(name)}</strong>"?<br>Это действие <strong>нельзя отменить</strong>.`,
        icon: 'danger',
        confirmText: 'Да, удалить',
        cancelText: 'Отмена',
        onConfirm: () => {
            window.location.href = `/leads/admin/project/${id}/delete/`;
        }
    });
}

// ========== МОДАЛЬНОЕ ОКНО (ВМЕСТО CONFIRM) ==========
function showModal(options) {
    const existingModal = document.getElementById('customModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const iconColor = options.icon === 'danger' ? '#ef4444' : '#f59e0b';
    const iconClass = options.icon === 'danger' ? 'fa-exclamation-triangle' : 'fa-question-circle';
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #111118, #0d0d12); border-radius: 28px; padding: 30px; max-width: 400px; width: 90%; text-align: center; border: 1px solid ${iconColor}; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <i class="fas ${iconClass}" style="font-size: 48px; color: ${iconColor}; margin-bottom: 20px;"></i>
            <h3 style="color: white; margin-bottom: 15px; font-size: 22px;">${escapeHtml(options.title)}</h3>
            <p style="color: #b0b0b0; margin-bottom: 25px; line-height: 1.5;">${options.message}</p>
            <div style="display: flex; gap: 15px;">
                <button id="modalConfirmBtn" style="flex: 1; background: ${options.icon === 'danger' ? '#ef4444' : '#b87333'}; color: white; border: none; padding: 12px; border-radius: 40px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                    <i class="fas ${options.icon === 'danger' ? 'fa-trash' : 'fa-check'}"></i> ${escapeHtml(options.confirmText)}
                </button>
                <button id="modalCancelBtn" style="flex: 1; background: rgba(17,17,24,0.8); border: 1px solid #b87333; color: white; padding: 12px; border-radius: 40px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                    <i class="fas fa-times"></i> ${escapeHtml(options.cancelText)}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    
    confirmBtn.addEventListener('click', () => {
        modal.remove();
        if (options.onConfirm) options.onConfirm();
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.remove();
        if (options.onCancel) options.onCancel();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// ========== 3D ЭФФЕКТ ПРИ НАВЕДЕНИИ ==========
function initCard3DEffect() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// ========== TOAST УВЕДОМЛЕНИЯ ==========
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
        animation: slideInRight 0.3s ease;
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

// ========== ЗАГРУЗКА ==========
function showLoading(show) {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10,10,15,0.9);
            backdrop-filter: blur(8px);
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 20px;
            display: none;
        `;
        overlay.innerHTML = `
            <div style="width: 50px; height: 50px; border: 3px solid rgba(184,115,51,0.2); border-top-color: #b87333; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: white;">Загрузка...</p>
        `;
        document.body.appendChild(overlay);
        
        if (!document.querySelector('#spin-style')) {
            const style = document.createElement('style');
            style.id = 'spin-style';
            style.textContent = `@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
            document.head.appendChild(style);
        }
    }
    overlay.style.display = show ? 'flex' : 'none';
}

// ========== ПОЛУЧЕНИЕ CSRF ТОКЕНА ==========
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

// ========== ESCAPE HTML ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== АНИМАЦИЯ ПОЯВЛЕНИЯ КАРТОЧЕК ==========
function initCardAnimations() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    collectClients();
    filterProjects();
    initClearFilters();
    initStatsClick();
    initCard3DEffect();
    initCardAnimations();
    
    const searchInput = document.getElementById('searchInput');
    const clientFilter = document.getElementById('clientFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) searchInput.addEventListener('input', filterProjects);
    if (clientFilter) clientFilter.addEventListener('change', filterProjects);
    if (statusFilter) statusFilter.addEventListener('change', filterProjects);
});

// Экспорт для глобального использования
window.toggleProject = toggleProject;
window.deleteProject = deleteProject;
window.filterProjects = filterProjects;
window.showToast = showToast;