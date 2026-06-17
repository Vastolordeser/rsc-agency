
// ========== АНИМАЦИЯ ПРИ ЗАГРУЗКЕ ==========
function animateDeletePage() {
    const container = document.querySelector('.delete-container');
    const card = document.querySelector('.delete-card');
    
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        setTimeout(() => {
            container.style.transition = 'all 0.4s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
    
    if (card) {
        const icon = card.querySelector('.delete-icon');
        if (icon) {
            icon.style.animation = 'pulseRed 2s infinite, shake 0.5s ease infinite';
        }
    }
}

// ========== ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ ==========
function initDeleteConfirmation() {
    const form = document.querySelector('form');
    const deleteBtn = document.querySelector('.btn-delete-confirm');
    const cancelBtn = document.querySelector('.btn-delete-cancel');
    
    if (form && deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            // Показываем индикатор загрузки
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Удаление...';
            this.disabled = true;
            // Форма отправится автоматически
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            // Анимация отмены
            this.style.transform = 'translateY(-2px)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    }
}

// ========== ПРЕДОТВРАЩЕНИЕ СЛУЧАЙНОГО УДАЛЕНИЯ ==========
function initDoubleConfirm() {
    const form = document.querySelector('form');
    if (!form) return;
    
    let submitted = false;
    
    form.addEventListener('submit', function(e) {
        if (!submitted) {
            e.preventDefault();
            const confirmMessage = 'ВНИМАНИЕ! Это действие НЕЛЬЗЯ будет отменить. Удалить услугу?';
            if (confirm(confirmMessage)) {
                submitted = true;
                form.submit();
            }
        }
    });
}

// ========== ЭФФЕКТ ПРИ НАВЕДЕНИИ НА КАРТОЧКУ ==========
function initCardEffects() {
    const card = document.querySelector('.delete-card');
    if (!card) return;
    
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    animateDeletePage();
    initDeleteConfirmation();
    initDoubleConfirm();
    initCardEffects();
});