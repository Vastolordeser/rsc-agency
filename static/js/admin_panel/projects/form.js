// form.js - Скрипты для формы создания/редактирования проекта (БЕЗ CONFIRM)

function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Превью">`;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function initFormValidation() {
    const form = document.querySelector('form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        const nameInput = document.querySelector('input[name="name"]');
        let hasError = false;
        
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => {
            el.style.borderColor = '';
        });
        
        if (!nameInput || !nameInput.value.trim()) {
            showFieldError(nameInput, 'Введите название проекта');
            hasError = true;
        }
        
        if (hasError) {
            e.preventDefault();
        } else {
            const submitBtn = form.querySelector('.btn-save');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
                submitBtn.disabled = true;
            }
        }
    });
}

function showFieldError(field, message) {
    if (!field) return;
    
    field.style.borderColor = '#ef4444';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = 'color: #ef4444; font-size: 12px; margin-top: 5px;';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    field.parentNode.appendChild(errorDiv);
    
    field.addEventListener('input', function() {
        field.style.borderColor = '';
        const error = field.parentNode.querySelector('.field-error');
        if (error) error.remove();
    }, { once: true });
}

function initAutoFormatting() {
    const nameInput = document.querySelector('input[name="name"]');
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.value = this.value.trim().charAt(0).toUpperCase() + this.value.trim().slice(1);
            }
        });
    }
    
    const clientInput = document.querySelector('input[name="client"]');
    if (clientInput) {
        clientInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.value = this.value.trim().charAt(0).toUpperCase() + this.value.trim().slice(1);
            }
        });
    }
}

function animateForm() {
    const container = document.querySelector('.form-container');
    const card = document.querySelector('.form-card');
    
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(30px)';
        setTimeout(() => {
            container.style.transition = 'all 0.5s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
    
    if (card) {
        const groups = document.querySelectorAll('.form-group');
        groups.forEach((group, index) => {
            group.style.opacity = '0';
            group.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                group.style.transition = `all 0.3s ease ${index * 0.05}s`;
                group.style.opacity = '1';
                group.style.transform = 'translateX(0)';
            }, 150);
        });
    }
}

function initFieldHints() {
    const descriptionTextarea = document.querySelector('textarea[name="description"]');
    if (descriptionTextarea) {
        descriptionTextarea.addEventListener('input', function() {
            const length = this.value.length;
            const hint = this.parentNode.querySelector('.field-hint');
            if (hint) {
                hint.innerHTML = `<i class="fas fa-info-circle"></i> ${length} символов`;
            }
        });
    }
}

function initCancelConfirmation() {
    const cancelBtn = document.querySelector('.btn-cancel');
    if (!cancelBtn) return;
    
    cancelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = this.getAttribute('href');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initFormValidation();
    initAutoFormatting();
    animateForm();
    initFieldHints();
    initCancelConfirmation();
});

window.previewImage = previewImage;