// confirm_delete.js - Удаление проекта (ИСПРАВЛЕН)

document.addEventListener('DOMContentLoaded', function() {
    // Анимация появления
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
    
    // Отправка формы при клике на кнопку удаления
    const deleteForm = document.querySelector('.delete-card form');
    const deleteBtn = document.querySelector('.btn-delete');
    const cancelBtn = document.querySelector('.btn-cancel');
    
    if (deleteForm && deleteBtn) {
        // Убираем старые обработчики
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        
        newDeleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Удаление...';
            this.disabled = true;
            deleteForm.submit();
        });
    }
    
    // Отмена
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = cancelBtn.getAttribute('href');
        });
    }
});