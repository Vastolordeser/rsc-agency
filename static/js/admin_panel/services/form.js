// form.js - Скрипты для формы создания/редактирования услуги

// ========== ПЕРЕКЛЮЧЕНИЕ ЧЕКБОКСА ==========
function toggleCheckbox() {
    const checkbox = document.getElementById('is_active');
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
    }
}

// ========== ПРЕВЬЮ ИЗОБРАЖЕНИЯ ==========
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    const previewImg = preview.querySelector('img');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (previewImg) {
                previewImg.src = e.target.result;
            } else {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.innerHTML = '';
                preview.appendChild(img);
            }
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ========== ВАЛИДАЦИЯ ФОРМЫ ==========
function initFormValidation() {
    const form = document.getElementById('serviceForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        const nameInput = document.getElementById('name');
        const categorySelect = document.getElementById('category');
        let hasError = false;
        
        // Очищаем предыдущие ошибки
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => {
            el.style.borderColor = '';
        });
        
        // Валидация названия
        if (!nameInput || !nameInput.value.trim()) {
            showFieldError(nameInput, 'Введите название услуги');
            hasError = true;
        }
        
        // Валидация категории
        if (!categorySelect || !categorySelect.value) {
            showFieldError(categorySelect, 'Выберите категорию');
            hasError = true;
        }
        
        if (hasError) {
            e.preventDefault();
        } else {
            // Показываем индикатор загрузки
            const submitBtn = form.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
                submitBtn.disabled = true;
            }
        }
    });
}

// ========== ПОКАЗ ОШИБКИ ПОД ПОЛЕМ ==========
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

// ========== АВТОМАТИЧЕСКОЕ ФОРМАТИРОВАНИЕ ЦЕНЫ ==========
function initPriceFormatting() {
    const priceInput = document.getElementById('price');
    if (!priceInput) return;
    
    priceInput.addEventListener('blur', function() {
        let value = this.value.trim();
        if (value && !value.includes('₽') && !value.toLowerCase().includes('руб')) {
            if (!isNaN(parseInt(value))) {
                this.value = value + ' ₽';
            }
        }
    });
    
    priceInput.addEventListener('focus', function() {
        let value = this.value.replace(' ₽', '').replace(' руб', '');
        this.value = value;
    });
}

// ========== ПОДСКАЗКИ ДЛЯ ПОЛЕЙ ==========
function initFieldHints() {
    const featuresTextarea = document.getElementById('features');
    if (featuresTextarea) {
        featuresTextarea.addEventListener('input', function() {
            const lines = this.value.split('\n').filter(l => l.trim());
            const hint = this.parentNode.querySelector('.field-hint');
            if (hint) {
                hint.innerHTML = `<i class="fas fa-info-circle"></i> ${lines.length} преимуществ(а) добавлено`;
            }
        });
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    initFormValidation();
    initPriceFormatting();
    initFieldHints();
});

// Экспорт для глобального использования
window.toggleCheckbox = toggleCheckbox;
window.previewImage = previewImage;