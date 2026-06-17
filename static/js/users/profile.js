// profile.js - Скрипты для страницы профиля пользователя

let currentLeadId = null;
let pendingFiles = [];

// ========== ВКЛАДКИ ==========
function initTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    const tabs = document.querySelectorAll('.tab-content');
    
    for (let i = 0; i < btns.length; i++) {
        btns[i].onclick = function() {
            const id = this.getAttribute('data-tab');
            for (let j = 0; j < btns.length; j++) {
                btns[j].classList.remove('active');
            }
            for (let j = 0; j < tabs.length; j++) {
                tabs[j].classList.remove('active');
            }
            this.classList.add('active');
            const activeTab = document.getElementById('tab-' + id);
            if (activeTab) activeTab.classList.add('active');
            if (id === 'messages' && typeof loadMessagesList === 'function') {
                loadMessagesList();
            }
        };
    }
    
    // Загрузка сообщений если активна вкладка
    if (document.querySelector('.tab-btn.active')?.getAttribute('data-tab') === 'messages') {
        loadMessagesList();
    }
}

// ========== АВАТАР ==========
function initAvatar() {
    const avatarClick = document.getElementById('avatarClick');
    const avatarInput = document.getElementById('avatarInput');
    const avatarForm = document.getElementById('avatarForm');
    
    if (avatarClick) {
        avatarClick.onclick = function() {
            avatarInput.click();
        };
    }
    
    if (avatarInput) {
        avatarInput.onchange = function() {
            avatarForm.submit();
        };
    }
}

// ========== УВЕДОМЛЕНИЯ ==========
function markRead(id) {
    fetch('/users/profile/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=mark_read&notif_id=' + id
    }).then(function() { location.reload(); });
}

function markAllRead() {
    fetch('/users/profile/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=mark_all_read'
    }).then(function() { location.reload(); });
}

// ========== ПРОСМОТР ЗАЯВКИ ==========
function openLeadModal(leadId) {
    const modalTitle = document.getElementById('leadModalTitle');
    const modalBody = document.getElementById('leadModalBody');
    const modal = document.getElementById('leadModal');
    
    if (modalTitle) modalTitle.innerHTML = 'Заявка #' + leadId;
    if (modal) modal.classList.add('active');
    
    fetch('/leads/api/lead/' + leadId + '/detail/')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (modalBody) {
                let html = '';
                html += '<div class="lead-detail-row"><div class="lead-detail-label">Имя</div><div class="lead-detail-value"><i class="fas fa-user"></i> ' + escapeHtml(data.name) + '</div></div>';
                html += '<div class="lead-detail-row"><div class="lead-detail-label">Email</div><div class="lead-detail-value"><i class="fas fa-envelope"></i> ' + escapeHtml(data.email) + '</div></div>';
                html += '<div class="lead-detail-row"><div class="lead-detail-label">Телефон</div><div class="lead-detail-value"><i class="fas fa-phone"></i> ' + escapeHtml(data.phone) + '</div></div>';
                if (data.service) html += '<div class="lead-detail-row"><div class="lead-detail-label">Услуга</div><div class="lead-detail-value"><i class="fas fa-cog"></i> ' + escapeHtml(data.service) + '</div></div>';
                html += '<div class="lead-detail-row"><div class="lead-detail-label">Статус</div><div class="lead-detail-value"><span class="lead-status status-' + data.status + '">' + data.status_display + '</span></div></div>';
                html += '<div class="lead-detail-row"><div class="lead-detail-label">Дата создания</div><div class="lead-detail-value"><i class="fas fa-calendar"></i> ' + data.created_at + '</div></div>';
                if (data.message) html += '<div class="lead-detail-row"><div class="lead-detail-label">Сообщение</div><div class="lead-detail-value">' + escapeHtml(data.message) + '</div></div>';
                modalBody.innerHTML = html;
            }
        })
        .catch(function() {
            if (modalBody) modalBody.innerHTML = '<div class="empty-state">Ошибка загрузки</div>';
        });
}

function closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) modal.classList.remove('active');
}

// ========== СООБЩЕНИЯ ==========
function loadMessagesList() {
    const container = document.getElementById('messagesList');
    if (!container) return;
    
    fetch('/leads/api/user/messages/')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.messages && data.messages.length) {
                let html = '';
                for (let i = 0; i < data.messages.length; i++) {
                    const msg = data.messages[i];
                    let statusText = msg.status === 'new' ? 'Новая' : (msg.status === 'processing' ? 'В обработке' : (msg.status === 'completed' ? 'Завершена' : 'Отклонена'));
                    html += '<div class="message-card" onclick="openChat(' + msg.lead_id + ')">';
                    html += '<div class="message-header"><span class="message-lead-id"><i class="fas fa-file-alt"></i> Заявка #' + msg.lead_id + '</span><span class="message-status status-' + msg.status + '">' + statusText + '</span></div>';
                    html += '<div class="message-body"><div class="message-preview">' + escapeHtml(msg.last_message || 'Нет сообщений') + '</div>';
                    html += '<div class="message-date"><i class="fas fa-clock"></i> ' + (msg.last_message_date || '') + '</div></div></div>';
                }
                container.innerHTML = html;
            } else {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>Нет сообщений</p></div>';
            }
        })
        .catch(function() {
            container.innerHTML = '<div class="empty-state">Ошибка загрузки</div>';
        });
}

function openChat(leadId) {
    currentLeadId = leadId;
    const chatTitle = document.getElementById('chatTitle');
    const chatModal = document.getElementById('chatModal');
    if (chatTitle) chatTitle.innerHTML = 'Заявка #' + leadId;
    if (chatModal) chatModal.classList.add('active');
    loadChatMessages(leadId);
}

function closeChat() {
    const chatModal = document.getElementById('chatModal');
    if (chatModal) chatModal.classList.remove('active');
    currentLeadId = null;
    const replyMessage = document.getElementById('replyMessage');
    if (replyMessage) replyMessage.value = '';
    pendingFiles = [];
    const selectedFilesList = document.getElementById('selectedFilesList');
    if (selectedFilesList) selectedFilesList.innerHTML = '';
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
}

function prepareFiles(input) {
    pendingFiles = [];
    const files = input.files;
    let listHtml = '';
    for (let i = 0; i < files.length; i++) {
        pendingFiles.push(files[i]);
        listHtml += '<span><i class="fas fa-file"></i> ' + files[i].name + ' (' + formatFileSize(files[i].size) + ')</span>';
    }
    const selectedFilesList = document.getElementById('selectedFilesList');
    if (selectedFilesList) selectedFilesList.innerHTML = listHtml;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function loadChatMessages(leadId) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i> Загрузка...</div>';
    
    fetch('/leads/api/lead/' + leadId + '/messages/')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.messages && data.messages.length) {
                let html = '';
                for (let i = 0; i < data.messages.length; i++) {
                    const msg = data.messages[i];
                    const isClient = msg.type === 'client';
                    html += '<div class="message-item ' + (isClient ? 'message-client' : 'message-admin') + '">';
                    html += '<div class="message-user"><i class="fas ' + (isClient ? 'fa-user' : 'fa-shield-alt') + '"></i> ' + escapeHtml(msg.user) + '</div>';
                    html += '<div class="message-text">' + escapeHtml(msg.message) + '</div>';
                    if (msg.attachments && msg.attachments.length) {
                        html += '<div class="message-attachments">';
                        for (let a = 0; a < msg.attachments.length; a++) {
                            html += '<a href="' + msg.attachments[a].url + '" class="attachment-item" download target="_blank"><i class="fas fa-paperclip"></i> ' + escapeHtml(msg.attachments[a].filename) + '</a>';
                        }
                        html += '</div>';
                    }
                    html += '<div class="message-time"><i class="fas fa-clock"></i> ' + msg.created_at + '</div>';
                    html += '</div>';
                }
                container.innerHTML = html;
                container.scrollTop = container.scrollHeight;
            } else {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-comment-slash"></i><p>Нет сообщений</p></div>';
            }
        })
        .catch(function() {
            container.innerHTML = '<div class="empty-state">Ошибка загрузки</div>';
        });
}

function sendMessage() {
    const message = document.getElementById('replyMessage').value.trim();
    if (!message && pendingFiles.length === 0) return;
    
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = 'Отправка...';
    btn.disabled = true;
    
    const formData = new FormData();
    formData.append('reply_message', message);
    for (let i = 0; i < pendingFiles.length; i++) {
        formData.append('attachments', pendingFiles[i]);
    }
    
    fetch('/users/lead/' + currentLeadId + '/reply/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            const replyMessage = document.getElementById('replyMessage');
            if (replyMessage) replyMessage.value = '';
            pendingFiles = [];
            const selectedFilesList = document.getElementById('selectedFilesList');
            if (selectedFilesList) selectedFilesList.innerHTML = '';
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.value = '';
            loadChatMessages(currentLeadId);
            loadMessagesList();
        } else {
            alert('Ошибка отправки');
        }
    })
    .catch(function() { alert('Ошибка сети'); })
    .finally(function() {
        btn.innerText = originalText;
        btn.disabled = false;
    });
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCookie(name) {
    let value = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                value = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return value;
}

// ========== ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН ПО КЛИКУ ВНЕ ==========
function initModalClose() {
    const leadModal = document.getElementById('leadModal');
    const chatModal = document.getElementById('chatModal');
    
    if (leadModal) {
        leadModal.onclick = function(e) {
            if (e.target === this) closeLeadModal();
        };
    }
    
    if (chatModal) {
        chatModal.onclick = function(e) {
            if (e.target === this) closeChat();
        };
    }
}

// ========== ENTER ДЛЯ ОТПРАВКИ СООБЩЕНИЯ ==========
function initEnterToSend() {
    const replyMessage = document.getElementById('replyMessage');
    if (replyMessage) {
        replyMessage.onkeypress = function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        };
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initAvatar();
    initModalClose();
    initEnterToSend();
    
    // Загрузка сообщений если активна вкладка
    if (document.querySelector('.tab-btn.active')?.getAttribute('data-tab') === 'messages') {
        loadMessagesList();
    }
});

// Экспорт для глобального использования
window.openLeadModal = openLeadModal;
window.closeLeadModal = closeLeadModal;
window.openChat = openChat;
window.closeChat = closeChat;
window.prepareFiles = prepareFiles;
window.sendMessage = sendMessage;
window.markRead = markRead;
window.markAllRead = markAllRead;
window.loadMessagesList = loadMessagesList;
window.loadChatMessages = loadChatMessages;