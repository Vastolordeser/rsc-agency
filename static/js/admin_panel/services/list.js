// list.js - Скрипты для страницы списка услуг

// ========== 3D ЭФФЕКТ ДЛЯ КАРТОЧЕК ==========
function initCard3DEffect() {
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.style.setProperty('--mouse-x', x + 'px');
            this.style.setProperty('--mouse-y', y + 'px');
        });
    });
}

// ========== ПОИСК В РЕАЛЬНОМ ВРЕМЕНИ ==========
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const cards = document.querySelectorAll('.service-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const name = card.getAttribute('data-name');
            if (name && name.includes(query)) {
                card.style.display = '';
                card.style.animation = 'fadeInUp 0.4s ease';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Показываем сообщение, если ничего не найдено
        const emptyState = document.querySelector('.empty-state');
        if (visibleCount === 0 && cards.length > 0) {
            if (!document.querySelector('.search-empty-state')) {
                const msg = document.createElement('div');
                msg.className = 'search-empty-state empty-state';
                msg.innerHTML = '<i class="fas fa-search"></i><h3>Ничего не найдено</h3><p>Попробуйте изменить поисковый запрос</p>';
                document.getElementById('servicesGrid')?.appendChild(msg);
            }
        } else {
            document.querySelector('.search-empty-state')?.remove();
        }
    });
}

// ========== TOAST УВЕДОМЛЕНИЯ ==========
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.backgroundColor = isError ? '#ef4444' : 'var(--gradient-gold)';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// ========== ЗАГРУЗКА ==========
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// ========== ПЕРЕКЛЮЧЕНИЕ СТАТУСА УСЛУГИ ==========
async function toggleService(id) {
    showLoading(true);
    try {
        const response = await fetch(`/leads/admin/services/${id}/toggle/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.success) {
            showToast(data.is_active ? '✅ Услуга активирована' : '⛔ Услуга скрыта');
            setTimeout(() => location.reload(), 500);
        } else {
            showToast('❌ Ошибка при изменении статуса', true);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showToast('❌ Ошибка сети', true);
    } finally {
        showLoading(false);
    }
}

// ========== УДАЛЕНИЕ УСЛУГИ ==========
async function confirmDelete(id, name) {
    if (confirm(`Вы уверены, что хотите удалить услугу "${name}"?`)) {
        showLoading(true);
        try {
            const response = await fetch(`/leads/admin/services/${id}/delete/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                showToast('✅ Услуга удалена');
                setTimeout(() => location.reload(), 500);
            } else {
                showToast('❌ Ошибка при удалении', true);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showToast('❌ Ошибка сети', true);
        } finally {
            showLoading(false);
        }
    }
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

// ========== АНИМАЦИЯ ПОЯВЛЕНИЯ КАРТОЧЕК ==========
function initCardAnimations() {
    const cards = document.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = (index * 0.05) + 's';
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    initCard3DEffect();
    initSearch();
    initCardAnimations();
});

// Экспорт для глобального использования
window.toggleService = toggleService;
window.confirmDelete = confirmDelete;
window.showToast = showToast;