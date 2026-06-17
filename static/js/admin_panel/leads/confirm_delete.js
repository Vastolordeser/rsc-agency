// confirm_delete.js - Подтверждение удаления заявки

(function() {
    'use strict';

    // Анимация появления
    function animatePage() {
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
    }

    // Подтверждение удаления
    function initDeleteConfirm() {
        const form = document.querySelector('form');
        const deleteBtn = document.querySelector('.btn-delete');
        
        if (!form || !deleteBtn) return;
        
        let isProcessing = false;
        
        deleteBtn.addEventListener('click', async (e) => {
            if (isProcessing) {
                e.preventDefault();
                return;
            }
            
            e.preventDefault();
            
            const leadName = document.querySelector('.client-info-value')?.textContent.trim() || 'этой заявки';
            
            // Кастомное подтверждение
            const confirmed = await showConfirmDialog(
                '⚠️ Удаление заявки',
                `Вы действительно хотите удалить заявку от "${leadName}"?`,
                'Это действие невозможно отменить!'
            );
            
            if (confirmed) {
                isProcessing = true;
                const originalText = deleteBtn.innerHTML;
                deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Удаление...';
                deleteBtn.disabled = true;
                deleteBtn.style.opacity = '0.7';
                
                // Отправляем форму
                form.submit();
            }
        });
    }

    // Диалоговое окно
    function showConfirmDialog(title, message, warning) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(5px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.2s ease;
            `;
            
            modal.innerHTML = `
                <div style="background: linear-gradient(135deg, #111118, #0d0d12); border-radius: 24px; padding: 30px; max-width: 400px; width: 90%; border: 1px solid rgba(239,68,68,0.3);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="width: 60px; height: 60px; background: rgba(239,68,68,0.1); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 28px; color: #ef4444;"></i>
                        </div>
                        <h3 style="color: #ef4444; margin: 0 0 10px 0; font-size: 20px;">${title}</h3>
                        <p style="color: #b0b0b0; margin: 0 0 10px 0;">${message}</p>
                        <p style="color: #ef4444; font-size: 13px;"><i class="fas fa-times-circle"></i> ${warning}</p>
                    </div>
                    <div style="display: flex; gap: 15px;">
                        <button id="modalCancel" style="flex: 1; padding: 12px; background: rgba(255,255,255,0.1); border: none; border-radius: 40px; color: #b0b0b0; cursor: pointer; font-weight: 600;">Отмена</button>
                        <button id="modalConfirm" style="flex: 1; padding: 12px; background: #ef4444; border: none; border-radius: 40px; color: white; cursor: pointer; font-weight: 600;">Удалить</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('modalConfirm').onclick = () => {
                modal.remove();
                resolve(true);
            };
            document.getElementById('modalCancel').onclick = () => {
                modal.remove();
                resolve(false);
            };
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(false);
                }
            };
        });
    }

    // Эффекты при наведении
    function initCardEffects() {
        const card = document.querySelector('.delete-card');
        if (card) {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        }
    }

    // Копирование информации
    function initCopyInfo() {
        const rows = document.querySelectorAll('.client-info-row');
        rows.forEach(row => {
            const label = row.querySelector('.client-info-label');
            const value = row.querySelector('.client-info-value');
            if (!label || !value) return;
            
            const copyBtn = document.createElement('i');
            copyBtn.className = 'fas fa-copy';
            copyBtn.style.cssText = `
                margin-left: 10px;
                cursor: pointer;
                font-size: 12px;
                color: #b87333;
                opacity: 0;
                transition: opacity 0.2s;
            `;
            copyBtn.title = 'Копировать';
            value.appendChild(copyBtn);
            
            row.addEventListener('mouseenter', () => copyBtn.style.opacity = '1');
            row.addEventListener('mouseleave', () => copyBtn.style.opacity = '0');
            
            copyBtn.onclick = async () => {
                const text = value.textContent.replace('Копировать', '').trim();
                await navigator.clipboard.writeText(text);
                
                const originalIcon = copyBtn.className;
                copyBtn.className = 'fas fa-check';
                setTimeout(() => {
                    copyBtn.className = originalIcon;
                }, 1000);
            };
        });
    }

    // Добавляем стили анимаций
    function addStyles() {
        if (document.querySelector('#delete-styles')) return;
        const style = document.createElement('style');
        style.id = 'delete-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Инициализация
    document.addEventListener('DOMContentLoaded', () => {
        addStyles();
        animatePage();
        initDeleteConfirm();
        initCardEffects();
        initCopyInfo();
    });
})();