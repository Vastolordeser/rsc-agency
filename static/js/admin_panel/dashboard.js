// dashboard.js - Скрипты для дашборда администратора

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let leadsChart = null;
let currentPeriod = 7;
let allLeadsData = [];
let notificationsData = [];

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

// ========== УСТАНОВКА ТЕКУЩЕЙ ДАТЫ ==========
function setCurrentDate() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const dateElement = document.getElementById('currentDate');
    if (dateElement) dateElement.innerText = dateStr;
}

// ========== СОЗДАНИЕ ПАРТИКЛОВ ДЛЯ ФОНА ==========
function createParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = 15 + Math.random() * 10 + 's';
        particle.style.width = (Math.random() * 4 + 1) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ========== ГРАФИК ДИНАМИКИ ЗАЯВОК ==========
async function loadChartData() {
    try {
        const canvas = document.getElementById('leadsChart');
        if (!canvas) return;
        
        const response = await fetch('/leads/admin/leads/json/?limit=100');
        const data = await response.json();
        
        // Группируем заявки по дням
        const leadsByDay = {};
        const today = new Date();
        
        for (let i = 0; i < currentPeriod; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const dateKey = `${day}.${month}.${year}`;
            leadsByDay[dateKey] = 0;
        }
        
        if (data.leads) {
            data.leads.forEach(lead => {
                const leadDate = lead.created_at.split(' ')[0];
                if (leadsByDay[leadDate] !== undefined) {
                    leadsByDay[leadDate]++;
                }
            });
        }
        
        const sortedDates = Object.keys(leadsByDay).sort((a, b) => {
            const [dayA, monthA, yearA] = a.split('.');
            const [dayB, monthB, yearB] = b.split('.');
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB;
        });
        
        const labels = sortedDates.map(d => {
            const [day, month] = d.split('.');
            return `${day}.${month}`;
        });
        const chartData = sortedDates.map(d => leadsByDay[d]);
        
        const ctx = canvas.getContext('2d');
        
        if (leadsChart) leadsChart.destroy();
        
        leadsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Заявки',
                    data: chartData,
                    borderColor: '#b87333',
                    backgroundColor: 'rgba(184,115,51,0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#b87333',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: '#b0b0b0', font: { size: 12 } } },
                    tooltip: {
                        backgroundColor: '#1a1a2e',
                        titleColor: '#b87333',
                        bodyColor: '#fff',
                        borderColor: '#b87333',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#b0b0b0', stepSize: 1 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#b0b0b0', rotation: 45, maxRotation: 45, minRotation: 45 }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки данных графика:', error);
    }
}

function changeChartPeriod(period) {
    currentPeriod = period;
    document.querySelectorAll('.chart-period-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.period) === period) {
            btn.classList.add('active');
        }
    });
    loadChartData();
}

// ========== СТАТИСТИКА ==========
async function refreshStats() {
    try {
        const response = await fetch('/leads/admin/leads/stats/');
        const data = await response.json();
        
        const statTotal = document.getElementById('statTotalLeads');
        const statNew = document.getElementById('statNewLeads');
        const statProcessing = document.getElementById('statProcessingLeads');
        const statCompleted = document.getElementById('statCompletedLeads');
        const statRejected = document.getElementById('statRejectedLeads');
        
        if (statTotal) statTotal.innerText = data.all || 0;
        if (statNew) statNew.innerText = data.new || 0;
        if (statProcessing) statProcessing.innerText = data.processing || 0;
        if (statCompleted) statCompleted.innerText = data.completed || 0;
        if (statRejected) statRejected.innerText = data.rejected || 0;
        
        const statsResp = await fetch('/leads/admin/stats/total/');
        const statsData = await statsResp.json();
        
        const statClients = document.getElementById('statTotalClients');
        const statServices = document.getElementById('statTotalServices');
        const statProjects = document.getElementById('statTotalProjects');
        const statEmployees = document.getElementById('statTotalEmployees');
        const statMessages = document.getElementById('statTotalMessages');
        
        if (statClients) statClients.innerText = statsData.clients || 0;
        if (statServices) statServices.innerText = statsData.services || 0;
        if (statProjects) statProjects.innerText = statsData.projects || 0;
        if (statEmployees) statEmployees.innerText = statsData.employees || 0;
        if (statMessages) statMessages.innerText = statsData.messages || 0;
        
        const maxLeads = Math.max(data.all, 1);
        const leadsProgress = document.getElementById('leadsProgress');
        if (leadsProgress) leadsProgress.style.width = Math.min(100, (data.all / maxLeads) * 100) + '%';
        
        await refreshNotificationsCount();
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// ========== УВЕДОМЛЕНИЯ ==========
async function refreshNotificationsCount() {
    try {
        const response = await fetch('/leads/api/notifications/');
        const data = await response.json();
        notificationsData = data.notifications || [];
        const unreadCount = notificationsData.filter(n => !n.is_read).length;
        const unreadElement = document.getElementById('unreadCount');
        if (unreadElement) unreadElement.innerText = unreadCount;
    } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
    }
}

async function openNotifications() {
    try {
        const response = await fetch('/leads/api/notifications/');
        const data = await response.json();
        const container = document.getElementById('notificationsList');
        
        if (container && data.notifications) {
            if (data.notifications.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 20px;">Нет уведомлений</div>';
            } else {
                let html = '';
                data.notifications.forEach(n => {
                    const unreadClass = !n.is_read ? 'notification-unread' : '';
                    html += '<div class="notification-item ' + unreadClass + '" onclick="markAndRedirect(' + n.id + ', \'' + (n.link || '#') + '\')">';
                    html += '<div class="notification-title">' + escapeHtml(n.title) + '</div>';
                    html += '<div class="notification-message">' + escapeHtml(n.message) + '</div>';
                    html += '<div class="notification-time">' + n.created_at + '</div>';
                    html += '</div>';
                });
                container.innerHTML = html;
            }
        }
        const modal = document.getElementById('notificationsModal');
        if (modal) modal.style.display = 'flex';
    } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
        const container = document.getElementById('notificationsList');
        if (container) container.innerHTML = '<div style="text-align: center; padding: 20px;">Ошибка загрузки</div>';
        const modal = document.getElementById('notificationsModal');
        if (modal) modal.style.display = 'flex';
    }
}

function closeNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) modal.style.display = 'none';
}

function markAndRedirect(notificationId, link) {
    fetch('/leads/api/notifications/' + notificationId + '/read/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    }).then(() => {
        window.location.href = link;
    }).catch(() => {
        window.location.href = link;
    });
}

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

// ========== ПОСЛЕДНИЕ ЗАЯВКИ ==========
async function refreshRecentLeads() {
    try {
        const response = await fetch('/leads/admin/leads/json/?limit=10');
        const data = await response.json();
        const container = document.getElementById('recentLeadsList');
        
        if (!container) return;
        
        if (data.leads && data.leads.length > 0) {
            let html = '';
            data.leads.forEach(lead => {
                let statusClass = '';
                switch(lead.status) {
                    case 'new': statusClass = 'status-new'; break;
                    case 'processing': statusClass = 'status-processing'; break;
                    case 'completed': statusClass = 'status-completed'; break;
                    case 'rejected': statusClass = 'status-rejected'; break;
                    default: statusClass = 'status-new';
                }
                html += '<div class="activity-item" onclick="window.location.href=\'/leads/admin/lead/' + lead.id + '/view/\'">';
                html += '<div class="activity-time">' + escapeHtml(lead.created_at) + '</div>';
                html += '<div class="activity-title">';
                html += '<span class="activity-status ' + statusClass + '"></span>';
                html += '<span style="color: #b87333;">#' + lead.id + '</span> - ' + escapeHtml(lead.name);
                html += '</div>';
                html += '<div class="activity-desc">' + (lead.message || 'Без сообщения').substring(0, 80) + '</div>';
                html += '</div>';
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="activity-item">Нет заявок</div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
    }
}

// ========== СОТРУДНИКИ ==========
async function refreshEmployees() {
    try {
        const response = await fetch('/leads/admin/employees/api/');
        const data = await response.json();
        const container = document.getElementById('employeesList');
        
        if (!container) return;
        
        if (data.employees && data.employees.length > 0) {
            let html = '';
            data.employees.forEach(emp => {
                const onlineClass = emp.is_online ? 'dot-online' : 'dot-offline';
                const onlineText = emp.is_online ? 'Онлайн' : 'Офлайн';
                html += '<div class="employee-item">';
                html += '<div class="employee-avatar"><i class="fas fa-user-circle"></i></div>';
                html += '<div class="employee-info">';
                html += '<div class="employee-name">' + escapeHtml(emp.username) + '</div>';
                html += '<div class="employee-position">' + (emp.position || 'Сотрудник') + '</div>';
                html += '</div>';
                html += '<div class="employee-status">';
                html += '<div class="status-dot ' + onlineClass + '"></div>';
                html += '<span style="font-size: 11px;">' + onlineText + '</span>';
                html += '</div></div>';
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="employee-item">Нет сотрудников</div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки сотрудников:', error);
    }
}

// ========== УСЛУГИ ==========
async function refreshServices() {
    try {
        const response = await fetch('/leads/api/services/');
        const data = await response.json();
        const container = document.getElementById('servicesList');
        
        if (!container) return;
        
        if (data.services && data.services.length > 0) {
            let html = '<ul class="services-list">';
            data.services.slice(0, 5).forEach(service => {
                html += '<li>';
                html += '<div class="service-info">';
                html += '<div class="service-icon"><i class="fas fa-cog"></i></div>';
                html += '<div>';
                html += '<div class="service-name">' + escapeHtml(service.name.substring(0, 30)) + '</div>';
                html += '<div class="service-category">' + escapeHtml(service.category) + '</div>';
                html += '</div></div>';
                html += '<div class="service-price">' + escapeHtml(service.price || '—') + '</div>';
                html += '</li>';
            });
            html += '</ul>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<ul class="services-list"><li>Нет услуг</li></ul>';
        }
    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
    }
}

// ========== КАЛЕНДАРЬ ==========
let currentCalendarDate = new Date();

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 7 : startDay;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const monthYearEl = document.getElementById('calendarMonthYear');
    if (monthYearEl) monthYearEl.innerText = monthNames[month] + ' ' + year;
    
    let html = '';
    for (let i = 1; i < startDay; i++) {
        html += '<div class="calendar-day"></div>';
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
        html += '<div class="calendar-day' + (isToday ? ' today' : '') + '" onclick="selectDate(' + i + ')">' + i + '</div>';
    }
    const daysEl = document.getElementById('calendarDays');
    if (daysEl) daysEl.innerHTML = html;
}

function prevMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

function selectDate(day) {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth() + 1;
    const date = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    window.location.href = '/leads/admin/leads/?date=' + date;
}

function openCalendar() {
    renderCalendar();
    const modal = document.getElementById('calendarModal');
    if (modal) modal.style.display = 'flex';
}

function closeCalendar() {
    const modal = document.getElementById('calendarModal');
    if (modal) modal.style.display = 'none';
}

// ========== ОБНОВЛЕНИЕ ВСЕХ ДАННЫХ ==========
async function refreshAllData() {
    await refreshStats();
    await refreshRecentLeads();
    await refreshEmployees();
    await refreshServices();
    await loadChartData();
}

// ========== ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН ==========
function initModalCloseOnBackground() {
    window.onclick = function(event) {
        const notificationsModal = document.getElementById('notificationsModal');
        const calendarModal = document.getElementById('calendarModal');
        if (event.target === notificationsModal) closeNotifications();
        if (event.target === calendarModal) closeCalendar();
    };
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    setCurrentDate();
    refreshAllData();
    initModalCloseOnBackground();
    
    document.querySelectorAll('.chart-period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            changeChartPeriod(parseInt(this.dataset.period));
        });
    });
    
setInterval(refreshAllData, 120000);   
setInterval(refreshNotificationsCount, 60000); 
});