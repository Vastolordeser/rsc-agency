// base.js - Базовые скрипты для админ-панели

// ========== МОБИЛЬНОЕ МЕНЮ ==========
function initMobileSidebar() {
    // Создаём кнопку, если её нет
    if (!document.getElementById('mobileToggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'mobileToggle';
        toggleBtn.className = 'mobile-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.insertBefore(toggleBtn, document.body.firstChild);
    }
    
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (!mobileToggle || !sidebar) return;
    
    mobileToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
        const icon = mobileToggle.querySelector('i');
        if (sidebar.classList.contains('mobile-open')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Закрываем меню при клике на ссылку (мобильные)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// ========== АКТИВНАЯ ПОДСВЕТКА ПУНКТОВ МЕНЮ ==========
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '/' && currentPath.includes(href)) {
            link.classList.add('active');
        }
        // Особый случай для дашборда
        if (href === '/leads/admin/dashboard/' && currentPath === '/leads/admin/dashboard/') {
            link.classList.add('active');
        }
        // Для лидов
        if (href === '/leads/admin/leads/' && currentPath.includes('/leads/admin/lead/')) {
            link.classList.add('active');
        }
        // Для клиентов
        if (href === '/leads/admin/clients/' && currentPath.includes('/leads/admin/client/')) {
            link.classList.add('active');
        }
        // Для услуг
        if (href === '/leads/admin/services/' && currentPath.includes('/leads/admin/service/')) {
            link.classList.add('active');
        }
        // Для проектов
        if (href === '/leads/admin/projects/' && currentPath.includes('/leads/admin/project/')) {
            link.classList.add('active');
        }
        // Для сотрудников
        if (href === '/leads/admin/employees/' && currentPath.includes('/leads/admin/employee/')) {
            link.classList.add('active');
        }
        // Для сообщений
        if (href === '/leads/admin/messages/' && currentPath.includes('/leads/admin/message/')) {
            link.classList.add('active');
        }
    });
}

// ========== УВЕДОМЛЕНИЯ ==========
function initToasts() {
    // Автоматическое исчезновение уведомлений через 4 секунды
    setTimeout(function() {
        const toasts = document.querySelectorAll('.toast');
        toasts.forEach(function(toast) {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(function() {
                if (toast && toast.remove) toast.remove();
            }, 300);
        });
    }, 4000);
    
    // Обработка закрытия по клику
    document.querySelectorAll('.toast .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const toast = this.closest('.toast');
            if (toast) toast.remove();
        });
    });
}

// ========== ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ ==========
function initDeleteConfirmations() {
    const deleteButtons = document.querySelectorAll('.btn-delete, [data-confirm]');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const message = this.dataset.confirm || 'Вы уверены, что хотите удалить?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });
}

// ========== АНИМАЦИЯ ПРИ ЗАГРУЗКЕ ==========
function initPageAnimations() {
    // Анимация для карточек
    const cards = document.querySelectorAll('.stat-card, .data-card, .card');
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
    initMobileSidebar();
    setActiveNavItem();
    initToasts();
    initDeleteConfirmations();
    initPageAnimations();
});