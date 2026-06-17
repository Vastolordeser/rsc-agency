// portfolio.js - Скрипты для страницы Портфолио

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let allProjects = [];
let currentCategory = 'all';
let currentPage = 1;
const itemsPerPage = 6;

const categoryNames = {
    'ads': 'Контекстная реклама',
    'smm': 'SMM',
    'seo': 'SEO',
    'dev': 'Разработка',
    'design': 'Дизайн'
};

// ========== ДАННЫЕ ДЛЯ СТАТИЧЕСКИХ БЛОКОВ ==========
// Новости
const newsData = [
    { id: 1, title: "Партнёрство с Google", description: "Мы стали официальным партнёром Google Premier Partner 2024! Теперь ещё больше возможностей для наших клиентов.", date: "15.03.2024", tag: "Партнёрство", icon: "fab fa-google" },
    { id: 2, title: "Запуск AI-платформы", description: "Внедрили искусственный интеллект для аналитики рекламных кампаний. Эффективность выросла на 40%.", date: "01.04.2024", tag: "Инновации", icon: "fas fa-brain" },
    { id: 3, title: "Международное признание", description: "Получили премию Best Digital Agency 2024 в номинации 'Лучшее агентство года'.", date: "10.04.2024", tag: "Награда", icon: "fas fa-trophy" },
    { id: 4, title: "Новый офис в Дубае", description: "Открыли представительство в ОАЭ. Теперь работаем с клиентами из 15 стран мира!", date: "05.04.2024", tag: "Развитие", icon: "fas fa-building" },
    { id: 5, title: "Сотрудничество с Microsoft", description: "Заключили стратегическое партнёрство с Microsoft для внедрения облачных решений.", date: "20.03.2024", tag: "Партнёрство", icon: "fab fa-microsoft" },
    { id: 6, title: "Запуск курсов по маркетингу", description: "Открыли бесплатную образовательную платформу для маркетологов. Более 5000 учеников уже с нами.", date: "25.03.2024", tag: "Образование", icon: "fas fa-graduation-cap" }
];

// Отзывы
const reviewsData = [
    { name: "Михаил Петров", position: "Маркетолог, ТехноСтарт", text: "Профессиональный подход, креативные идеи, результат превзошёл ожидания! Охваты выросли на 300% за первый месяц работы.", rating: 5 },
    { name: "Елена Смирнова", position: "CEO, BeautyLab", text: "Лучшее агентство с которым мы работали. Результат виден с первых недель. Рекомендуем!", rating: 5 },
    { name: "Анна Коваленко", position: "Директор по маркетингу", text: "Отличная команда профессионалов. Всегда на связи, быстро реагируют на любые задачи.", rating: 5 },
    { name: "Дмитрий Зайцев", position: "Владелец бизнеса", text: "Сотрудничаем уже 2 года. Ребята реально знают своё дело. Продажи выросли в 2 раза!", rating: 5 },
    { name: "Ольга Соколова", position: "Brand Manager, LVMH", text: "Международный уровень сервиса! Помогли вывести бренд на рынок Франции.", rating: 5 },
    { name: "Алексей Морозов", position: "CEO, Alibaba Russia", text: "Профессионалы высшего уровня. Сделали невозможное возможным!", rating: 5 }
];

// Компании-партнёры
const companies = [
    { name: "Google", icon: "fab fa-google" },
    { name: "Microsoft", icon: "fab fa-microsoft" },
    { name: "Amazon", icon: "fab fa-amazon" },
    { name: "Apple", icon: "fab fa-apple" },
    { name: "Meta", icon: "fab fa-meta" },
    { name: "Tesla", icon: "fab fa-tesla" },
    { name: "Spotify", icon: "fab fa-spotify" },
    { name: "Netflix", icon: "fab fa-netflix" }
];

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCountryFlag(client) {
    if (!client) return '🇷🇺';
    if (client.includes('США') || client.includes('Google') || client.includes('Microsoft') || client.includes('Apple')) return '🇺🇸';
    if (client.includes('Франция') || client.includes('LVMH')) return '🇫🇷';
    if (client.includes('Китай') || client.includes('Alibaba')) return '🇨🇳';
    if (client.includes('Германия') || client.includes('BMW')) return '🇩🇪';
    return '🇷🇺';
}

// ========== ЗАГРУЗКА ПРОЕКТОВ ИЗ API ==========
async function loadProjects() {
    try {
        const response = await fetch('/leads/api/projects/');
        const data = await response.json();
        allProjects = data.projects || [];
        
        const statProjectsEl = document.getElementById('statProjects');
        if (statProjectsEl) statProjectsEl.innerText = allProjects.length;
        
        renderProjects();
        initFilters();
    } catch(e) {
        console.error('Ошибка загрузки проектов:', e);
        const projectsGrid = document.getElementById('projectsGrid');
        if (projectsGrid) {
            projectsGrid.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Ошибка загрузки</h3><p>Не удалось загрузить проекты</p></div>';
        }
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ФИЛЬТРОВ ==========
function initFilters() {
    // Собираем уникальные категории из проектов
    const categories = new Map();
    categories.set('all', allProjects.length);
    
    allProjects.forEach(project => {
        const cat = project.category;
        if (cat) {
            categories.set(cat, (categories.get(cat) || 0) + 1);
        }
    });
    
    const filtersContainer = document.querySelector('.portfolio-filters');
    if (!filtersContainer) return;
    
    let filtersHtml = `
        <button class="filter-btn active" data-category="all">
            <i class="fas fa-th-large"></i> Все проекты
            <span class="filter-count">(${categories.get('all')})</span>
        </button>
    `;
    
    for (let [cat, count] of categories) {
        if (cat !== 'all') {
            const name = categoryNames[cat] || cat;
            filtersHtml += `
                <button class="filter-btn" data-category="${cat}">
                    <i class="fas fa-folder"></i> ${name}
                    <span class="filter-count">(${count})</span>
                </button>
            `;
        }
    }
    
    filtersContainer.innerHTML = filtersHtml;
    
    // Добавляем обработчики для фильтров
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            currentPage = 1;
            renderProjects();
        });
    });
}

// ========== ФИЛЬТРАЦИЯ ПРОЕКТОВ ==========
function filterProjectsByCategory() {
    if (currentCategory === 'all') {
        return allProjects;
    }
    return allProjects.filter(project => project.category === currentCategory);
}

// ========== ПАГИНАЦИЯ ==========
function getPaginatedProjects() {
    const filtered = filterProjectsByCategory();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
        projects: filtered.slice(start, end),
        totalPages: Math.ceil(filtered.length / itemsPerPage),
        totalProjects: filtered.length
    };
}

// ========== ОТОБРАЖЕНИЕ ПРОЕКТОВ ==========
function renderProjects() {
    const { projects, totalPages } = getPaginatedProjects();
    const container = document.getElementById('projectsGrid');
    
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-briefcase"></i><h3>Нет проектов</h3><p>В этой категории пока нет проектов</p></div>';
        const paginationDiv = document.getElementById('pagination');
        if (paginationDiv) paginationDiv.innerHTML = '';
        return;
    }
    
    let html = '';
    projects.forEach((project, i) => {
        // Формируем HTML для изображения
        let imageHtml = '';
        if (project.image && project.image !== "null" && project.image !== "") {
            let imgUrl = project.image;
            if (!imgUrl.startsWith("http")) {
                imgUrl = window.location.origin + imgUrl;
            }
            imageHtml = `<img src="${imgUrl}" alt="${escapeHtml(project.name)}">`;
        } else {
            imageHtml = `<i class="fas fa-rocket"></i>`;
        }
        
        // Формируем статистику (рандомные, но стабильные для демо)
        const growthPercent = Math.floor(Math.abs(Math.sin(project.id * 100) * 200) + 50);
        
        html += `
            <div class="project-card" onclick="openProjectModal(${project.id})" style="animation: fadeInScale 0.5s ease ${i * 0.05}s forwards; opacity:0;">
                <div class="project-image">
                    ${imageHtml}
                    <div class="country-flag">${getCountryFlag(project.client)}</div>
                    <div class="project-badge">${categoryNames[project.category] || project.category || 'Проект'}</div>
                </div>
                <div class="project-content">
                    <div class="project-title">${escapeHtml(project.name)}</div>
                    <div class="project-client"><i class="fas fa-building"></i> ${escapeHtml(project.client)}</div>
                    <div class="project-description">${escapeHtml(project.description ? project.description.substring(0, 120) : '')}${project.description && project.description.length > 120 ? '...' : ''}</div>
                    <div class="project-meta">
                        <span class="project-category">${categoryNames[project.category] || project.category || 'Проект'}</span>
                        <div class="project-stats">
                            <span><i class="fas fa-chart-line"></i> +${growthPercent}%</span>
                            <span><i class="fas fa-calendar"></i> 2024</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    renderPagination(totalPages);
}

// ========== ОТОБРАЖЕНИЕ ПАГИНАЦИИ ==========
function renderPagination(totalPages) {
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;
    
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let pagesHtml = '';
    pagesHtml += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
    </button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        pagesHtml += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    pagesHtml += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
    </button>`;
    
    paginationDiv.innerHTML = pagesHtml;
}

// ========== СМЕНА СТРАНИЦЫ ==========
function changePage(page) {
    const { totalPages } = getPaginatedProjects();
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderProjects();
    window.scrollTo({ top: 500, behavior: 'smooth' });
}

// ========== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ПРОЕКТА ==========
async function openProjectModal(id) {
    try {
        const response = await fetch(`/leads/api/projects/${id}/`);
        const project = await response.json();
        alert(`${project.name}\n\nКлиент: ${project.client}\nКатегория: ${categoryNames[project.category] || project.category}\n\n${project.description}\n\nРезультат: ${project.result || 'Рост продаж +45% за 3 месяца'}`);
    } catch(e) {
        console.error('Ошибка загрузки проекта:', e);
        alert('Ошибка загрузки деталей проекта');
    }
}

// ========== ОТОБРАЖЕНИЕ НОВОСТЕЙ ==========
function renderNews() {
    const container = document.getElementById('newsGrid');
    if (!container) return;
    
    let html = '';
    newsData.forEach(news => {
        html += `
            <div class="news-card">
                <div class="news-date">${news.date}</div>
                <div class="news-image"><i class="${news.icon}"></i></div>
                <div class="news-content">
                    <h3 class="news-title">${escapeHtml(news.title)}</h3>
                    <p class="news-description">${escapeHtml(news.description)}</p>
                    <span class="news-tag">${escapeHtml(news.tag)}</span>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ========== ОТОБРАЖЕНИЕ ОТЗЫВОВ ==========
function renderReviews() {
    const container = document.getElementById('reviewsSlider');
    if (!container) return;
    
    let html = '';
    reviewsData.forEach(review => {
        let stars = '';
        for (let i = 0; i < review.rating; i++) stars += '★';
        for (let i = review.rating; i < 5; i++) stars += '☆';
        
        html += `
            <div class="review-card">
                <div class="review-stars">${stars}</div>
                <div class="review-text">"${escapeHtml(review.text)}"</div>
                <div class="review-author">
                    <div class="review-avatar"><i class="fas fa-user"></i></div>
                    <div>
                        <h4>${escapeHtml(review.name)}</h4>
                        <p>${escapeHtml(review.position)}</p>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ========== ОТОБРАЖЕНИЕ КОМПАНИЙ-ПАРТНЁРОВ (БЕГУЩАЯ СТРОКА) ==========
function renderCompanies() {
    const container = document.getElementById('clientsMarquee');
    if (!container) return;
    
    let html = '';
    // Дублируем для бесконечной анимации
    for (let i = 0; i < 2; i++) {
        companies.forEach(company => {
            html += `
                <div class="client-logo">
                    <i class="${company.icon}"></i>
                    <span>${company.name}</span>
                </div>
            `;
        });
    }
    container.innerHTML = html;
}

// ========== AI ЧАТ-БОТ ==========
let allProjectsForChat = [];

function initChat() {
    const chatButton = document.getElementById('chatButton');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatButton || !chatWindow) return;
    
    chatButton.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
    });
    
    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('open');
        });
    }
    
    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        addMessage(message, true);
        chatInput.value = '';
        
        let response = '';
        const msg = message.toLowerCase();
        
        if (msg.includes('проект') || msg.includes('портфолио')) {
            response = `У нас ${allProjects.length} успешных проектов! Хотите посмотреть кейсы? Нажмите на любую карточку проекта.`;
        } else if (msg.includes('цена') || msg.includes('стоимость') || msg.includes('сколько')) {
            response = `Стоимость услуг рассчитывается индивидуально. Оставьте заявку в разделе "Контакты" и мы подготовим для вас предложение!`;
        } else if (msg.includes('срок') || msg.includes('длительность')) {
            response = `Средний срок реализации проекта: от 2 недель до 3 месяцев в зависимости от сложности.`;
        } else if (msg.includes('отзыв')) {
            response = `У нас более 200 довольных клиентов! Средняя оценка 4.98/5. Можете посмотреть отзывы выше на этой странице.`;
        } else if (msg.includes('партнёр') || msg.includes('сотрудничество')) {
            response = `Мы открыты к сотрудничеству! Работаем с Google, Microsoft, Amazon и другими. Напишите нам в контактах!`;
        } else if (msg.includes('привет')) {
            response = `Привет! Рад видеть тебя на нашем сайте! Чем могу помочь сегодня?`;
        } else {
            response = `Спасибо за вопрос! Наши специалисты свяжутся с вами в ближайшее время. А пока посмотрите наши проекты и отзывы! 🚀`;
        }
        
        setTimeout(() => addMessage(response, false), 500);
    }
    
    if (chatSend) {
        chatSend.addEventListener('click', sendMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

// ========== ПАРТИКЛЫ НА CANVAS ==========
function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    const particleCount = 80;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.1,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(184, 115, 51, ${p.alpha})`;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Обновляем размер canvas при изменении окна
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ========== АНИМАЦИЯ ПРИ СКРОЛЛЕ ==========
function initScrollAnimation() {
    const revealElements = document.querySelectorAll('.reviews-section, .clients-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'all 0.8s ease';
        observer.observe(el);
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollAnimation();
    loadProjects();
    renderNews();
    renderReviews();
    renderCompanies();
    initChat();
});

// Экспорт для глобального использования
window.openProjectModal = openProjectModal;
window.changePage = changePage;