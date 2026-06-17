// reply.js - Скрипты для страницы ответа на сообщение

// ========== АНИМАЦИЯ ПОЯВЛЕНИЯ ==========
function animateReplyPage() {
    const container = document.querySelector('.reply-container');
    const card = document.querySelector('.reply-card');
    
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
        const details = document.querySelectorAll('.detail-item');
        details.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                item.style.transition = `all 0.3s ease ${index * 0.05}s`;
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 150);
        });
        
        const originalMsg = document.querySelector('.original-message');
        if (originalMsg) {
            originalMsg.style.opacity = '0';
            setTimeout(() => {
                originalMsg.style.transition = 'all 0.4s ease 0.2s';
                originalMsg.style.opacity = '1';
            }, 250);
        }
        
        const form = document.querySelector('.reply-form');
        if (form) {
            form.style.opacity = '0';
            setTimeout(() => {
                form.style.transition = 'all 0.4s ease 0.4s';
                form.style.opacity = '1';
            }, 350);
        }
    }
}

// ========== ВАЛИДАЦИЯ ФОРМЫ ==========
function initReplyFormValidation() {
    const form = document.querySelector('form');
    const textarea = document.querySelector('textarea[name="reply_text"]');
    
    if (!form || !textarea) return;
    
    form.addEventListener('submit', function(e) {
        const message = textarea.value.trim();
        
        if (!message) {
            e.preventDefault();
            showFieldError(textarea, 'Введите текст ответа');
            textarea.focus();
            return;
        }
        
        // Показываем индикатор загрузки
        const submitBtn = form.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            submitBtn.disabled = true;
        }
    });
    
    textarea.addEventListener('input', function() {
        const error = this.parentNode.querySelector('.field-error');
        if (error) error.remove();
        this.style.borderColor = '';
    });
}

// ========== ПОКАЗ ОШИБКИ ==========
function showFieldError(field, message) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    field.style.borderColor = '#ef4444';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = 'color: #ef4444; font-size: 12px; margin-top: 5px;';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    field.parentNode.appendChild(errorDiv);
}

// ========== СЧЁТЧИК СИМВОЛОВ ==========
function initCharCounter() {
    const textarea = document.querySelector('textarea[name="reply_text"]');
    if (!textarea) return;
    
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.style.cssText = `
        text-align: right;
        font-size: 11px;
        color: #6c6c7a;
        margin-top: 5px;
    `;
    textarea.parentNode.appendChild(counter);
    
    function updateCounter() {
        const length = textarea.value.length;
        const maxLength = textarea.getAttribute('maxlength') || 5000;
        counter.innerHTML = `${length} / ${maxLength} символов`;
        
        if (length > maxLength * 0.9) {
            counter.style.color = '#f59e0b';
        } else if (length > maxLength) {
            counter.style.color = '#ef4444';
        } else {
            counter.style.color = '#6c6c7a';
        }
    }
    
    textarea.addEventListener('input', updateCounter);
    updateCounter();
}

// ========== ПРЕДПРОСМОТР ОТВЕТА ==========
function initPreview() {
    const textarea = document.querySelector('textarea[name="reply_text"]');
    if (!textarea) return;
    
    const previewBtn = document.createElement('button');
    previewBtn.type = 'button';
    previewBtn.className = 'preview-btn';
    previewBtn.innerHTML = '<i class="fas fa-eye"></i> Предпросмотр';
    previewBtn.style.cssText = `
        background: rgba(184,115,51,0.15);
        border: 1px solid rgba(184,115,51,0.3);
        border-radius: 30px;
        padding: 6px 16px;
        color: #b87333;
        font-size: 12px;
        cursor: pointer;
        margin-bottom: 10px;
        transition: all 0.3s;
    `;
    textarea.parentNode.insertBefore(previewBtn, textarea);
    
    previewBtn.addEventListener('mouseenter', () => {
        previewBtn.style.background = '#b87333';
        previewBtn.style.color = 'white';
    });
    previewBtn.addEventListener('mouseleave', () => {
        previewBtn.style.background = 'rgba(184,115,51,0.15)';
        previewBtn.style.color = '#b87333';
    });
    
    previewBtn.addEventListener('click', () => {
        const text = textarea.value.trim();
        if (!text) {
            alert('Введите текст ответа для предпросмотра');
            return;
        }
        
        showPreviewModal(text);
    });
}

function showPreviewModal(text) {
    let modal = document.querySelector('.preview-modal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #111118, #0d0d12);
        border-radius: 24px;
        border: 1px solid rgba(184,115,51,0.3);
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: auto;
        padding: 25px;
    `;
    
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="color: #b87333;"><i class="fas fa-eye"></i> Предпросмотр ответа</h3>
            <button class="close-preview" style="background: none; border: none; color: #b0b0b0; font-size: 24px; cursor: pointer;">&times;</button>
        </div>
        <div style="background: rgba(0,0,0,0.2); border-radius: 16px; padding: 20px; border-left: 3px solid #b87333;">
            <p style="color: #e0e0e0; line-height: 1.6; white-space: pre-wrap;">${escapeHtmlPreview(text)}</p>
        </div>
        <div style="margin-top: 20px; text-align: right;">
            <button class="close-preview-btn" style="background: linear-gradient(135deg, #b87333, #e8a05e); border: none; border-radius: 30px; padding: 8px 24px; color: white; cursor: pointer;">Закрыть</button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    const closeButtons = modal.querySelectorAll('.close-preview, .close-preview-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function escapeHtmlPreview(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// ========== ПОДТВЕРЖДЕНИЕ ОТМЕНЫ ==========
function initCancelConfirmation() {
    const cancelBtn = document.querySelector('.btn-cancel');
    if (!cancelBtn) return;
    
    cancelBtn.addEventListener('click', function(e) {
        const textarea = document.querySelector('textarea[name="reply_text"]');
        if (textarea && textarea.value.trim()) {
            if (!confirm('Вы уверены, что хотите отменить? Текст ответа будет потерян.')) {
                e.preventDefault();
            }
        }
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    animateReplyPage();
    initReplyFormValidation();
    initCharCounter();
    initPreview();
    initCancelConfirmation();
});