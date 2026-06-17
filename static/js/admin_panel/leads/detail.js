// detail.js - Детальная страница заявки

(function() {
    'use strict';

    // Загрузка истории
    async function loadHistory() {
        const container = document.getElementById('historyList');
        if (!container) return;
        
        const leadId = window.location.pathname.match(/\/lead\/(\d+)\//)?.[1];
        if (!leadId) return;
        
        try {
            const response = await fetch(`/leads/admin/lead/${leadId}/history/`);
            const data = await response.json();
            
            if (data.history && data.history.length > 0) {
                container.innerHTML = data.history.map(item => {
                    let icon = 'fa-pen';
                    let actionText = item.action;
                    
                    if (item.action === 'change_status') {
                        actionText = `Статус: ${item.old_status} → ${item.new_status}`;
                        icon = 'fa-exchange-alt';
                    } else if (item.action === 'admin_reply') {
                        actionText = 'Ответ администратора';
                        icon = 'fa-shield-alt';
                    } else if (item.action === 'client_reply') {
                        actionText = 'Ответ клиента';
                        icon = 'fa-user';
                    }
                    
                    return `
                        <div class="history-item">
                            <div class="history-icon"><i class="fas ${icon}"></i></div>
                            <div class="history-content">
                                <div class="history-action">${escapeHtml(actionText)}</div>
                                ${item.comment ? `<div class="history-detail">${escapeHtml(item.comment)}</div>` : ''}
                                ${item.attachments?.length ? `
                                    <div class="history-attachments">
                                        ${item.attachments.map(att => `
                                            <a href="${att.url}" target="_blank" class="attachment-link">
                                                <i class="fas fa-file"></i> ${escapeHtml(att.filename)}
                                            </a>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                <div class="history-time">
                                    <span><i class="fas fa-user"></i> ${escapeHtml(item.created_by)}</span>
                                    <span><i class="fas fa-clock"></i> ${item.created_at}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                container.innerHTML = '<div class="empty-history"><i class="fas fa-history"></i><p>Нет истории</p></div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="empty-history"><i class="fas fa-exclamation-triangle"></i><p>Ошибка загрузки</p></div>';
        }
    }

    // Отправка ответа
    function initReplyForm() {
        const form = document.querySelector('.reply-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const message = form.querySelector('textarea[name="reply_message"]')?.value.trim();
            const files = form.querySelector('input[name="attachments"]')?.files;
            
            if (!message && (!files || files.length === 0)) {
                showToast('Введите текст или прикрепите файл', 'warning');
                return;
            }
            
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            btn.disabled = true;
            
            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });
                
                if (response.ok) {
                    showToast('Ответ отправлен', 'success');
                    form.reset();
                    document.getElementById('adminSelectedFiles').innerHTML = '';
                    await loadHistory();
                } else {
                    throw new Error();
                }
            } catch (error) {
                showToast('Ошибка отправки', 'error');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // Изменение статуса
    function initStatusChange() {
        const form = document.querySelector('.status-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
            btn.disabled = true;
            
            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });
                
                if (response.ok) {
                    showToast('Статус изменен', 'success');
                    await loadHistory();
                    location.reload();
                } else {
                    throw new Error();
                }
            } catch (error) {
                showToast('Ошибка изменения статуса', 'error');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // Файлы
    function initFileInput() {
        const input = document.getElementById('adminFileInput');
        const container = document.getElementById('adminSelectedFiles');
        if (!input || !container) return;
        
        input.addEventListener('change', () => {
            const files = Array.from(input.files);
            container.innerHTML = files.map(f => `
                <span><i class="fas fa-file"></i> ${f.name} (${formatSize(f.size)})</span>
            `).join('');
        });
    }

    // Toast уведомления
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b' };
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: ${colors[type]}; color: white;
            padding: 10px 20px; border-radius: 40px;
            font-size: 14px; z-index: 1000;
            animation: fadeInUp 0.3s ease;
        `;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // Удаление с подтверждением
    function initDeleteButton() {
        const btn = document.querySelector('.btn-delete');
        if (!btn) return;
        
        btn.addEventListener('click', (e) => {
            if (!confirm('Удалить эту заявку? Действие необратимо!')) {
                e.preventDefault();
            }
        });
    }

    // Инициализация
    document.addEventListener('DOMContentLoaded', () => {
        loadHistory();
        initReplyForm();
        initStatusChange();
        initFileInput();
        initDeleteButton();
        
        // Автообновление каждые 30 секунд
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadHistory();
            }
        }, 30000);
    });
})();