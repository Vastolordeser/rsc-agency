// services.js - Скрипты для страницы Услуги

// ==========================================================================
// ДАННЫЕ И СОСТОЯНИЕ
// ==========================================================================
let allServices = [];
let currentCategory = 'all';
let currentPage = 1;
const itemsPerPage = 9;

// Сопоставление категорий
const categoryNames = {
    'ads': 'Контекстная реклама',
    'target': 'Таргетинг',
    'seo': 'SEO',
    'smm': 'SMM',
    'dev': 'Разработка',
    'design': 'Дизайн'
};

const categoryIcons = {
    'ads': 'fa-ad',
    'target': 'fa-bullseye',
    'seo': 'fa-search',
    'smm': 'fa-instagram',
    'dev': 'fa-code',
    'design': 'fa-palette'
};

// ==========================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatPrice(price) {
    if (!price) return 'По запросу';
    if (typeof price === 'number') {
        return price.toLocaleString('ru-RU') + ' ₽';
    }
    return price;
}

// ==========================================================================
// API ЗАГРУЗКА УСЛУГ
// ==========================================================================
async function loadServices() {
    try {
        const response = await fetch('/leads/api/services/');
        const data = await response.json();
        allServices = data.services;
        
        const statTotal = document.getElementById('statTotal');
        if (statTotal) statTotal.innerText = allServices.length;
        
        updateFilters();
        renderServices();
    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        const container = document.getElementById('servicesContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Ошибка загрузки</h3>
                    <p>Не удалось загрузить услуги. Проверьте соединение.</p>
                </div>
            `;
        }
    }
}

// ==========================================================================
// ФИЛЬТРЫ
// ==========================================================================
function updateFilters() {
    const categories = new Map();
    categories.set('all', allServices.length);
    
    allServices.forEach(service => {
        const cat = service.category;
        categories.set(cat, (categories.get(cat) || 0) + 1);
    });
    
    let filtersHtml = `
        <button class="filter-pill active" data-category="all">
            <i class="fas fa-th-large"></i> Все услуги
            <span class="filter-count">(${categories.get('all')})</span>
        </button>
    `;
    
    for (let [cat, count] of categories) {
        if (cat !== 'all') {
            const name = categoryNames[cat] || cat;
            const icon = categoryIcons[cat] || 'fa-cog';
            filtersHtml += `
                <button class="filter-pill" data-category="${cat}">
                    <i class="fas ${icon}"></i> ${name}
                    <span class="filter-count">(${count})</span>
                </button>
            `;
        }
    }
    
    const filtersContainer = document.getElementById('filtersContainer');
    if (filtersContainer) filtersContainer.innerHTML = filtersHtml;
    
    // Добавляем обработчики событий для фильтров
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            currentPage = 1;
            renderServices();
        });
    });
}

// ==========================================================================
// ФИЛЬТРАЦИЯ УСЛУГ
// ==========================================================================
function filterServices() {
    if (currentCategory === 'all') {
        return allServices;
    }
    return allServices.filter(service => service.category === currentCategory);
}

// ==========================================================================
// ПАГИНАЦИЯ
// ==========================================================================
function getPaginatedServices() {
    const filtered = filterServices();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
        services: filtered.slice(start, end),
        totalPages: Math.ceil(filtered.length / itemsPerPage),
        totalServices: filtered.length
    };
}

// ==========================================================================
// ОТОБРАЖЕНИЕ УСЛУГ
// ==========================================================================
function renderServices() {
    const { services, totalPages } = getPaginatedServices();
    const container = document.getElementById('servicesContainer');
    
    if (!container) return;
    
    if (services.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-cogs"></i>
                <h3>Нет услуг</h3>
                <p>В этой категории пока нет услуг. Скоро они появятся!</p>
            </div>
        `;
        const paginationDiv = document.getElementById('pagination');
        if (paginationDiv) paginationDiv.innerHTML = '';
        return;
    }
    
    let servicesHtml = '<div class="services-grid">';
    
    services.forEach((service, index) => {
        let features = [];
        if (service.features) {
            if (Array.isArray(service.features)) {
                features = service.features;
            } else if (typeof service.features === 'string') {
                features = service.features.split(',').map(f => f.trim());
            }
        }
        
        // Определяем иконку или изображение
        let iconHtml = '';
        if (service.image_url && service.image_url !== "null" && service.image_url !== "") {
            let imgUrl = service.image_url;
            if (imgUrl && !imgUrl.startsWith("http")) {
                imgUrl = window.location.origin + imgUrl;
            }
            iconHtml = `<img src="${imgUrl}" alt="${escapeHtml(service.name)}">`;
        } else {
            iconHtml = `<i class="fas ${categoryIcons[service.category] || 'fa-cog'}"></i>`;
        }
        
        // Бейдж
        let badgeHtml = '';
        if (service.popular) {
            badgeHtml = '<div class="service-badge popular"><i class="fas fa-fire"></i> Популярно</div>';
        } else if (service.is_new) {
            badgeHtml = '<div class="service-badge new"><i class="fas fa-star"></i> Новинка</div>';
        }
        
        servicesHtml += `
            <div class="service-card" style="animation-delay: ${index * 0.05}s"
                 data-service-id="${service.id}"
                 onmousemove="handleCardMove(event, this)"
                 onmouseleave="handleCardLeave(this)">
                ${badgeHtml}
                <div class="service-price-badge">${escapeHtml(formatPrice(service.price))}</div>
                <div class="service-icon">
                    ${iconHtml}
                    <div class="icon-pulse"></div>
                </div>
                <div class="service-content">
                    <h3 class="service-title">${escapeHtml(service.name)}</h3>
                    <p class="service-description">${escapeHtml(service.description || '')}</p>
                    <div class="service-features">
                        ${features.map(f => `<span class="feature-tag">${escapeHtml(f)}</span>`).join('')}
                    </div>
                    <button class="service-order-btn" onclick="window.location.href='/leads/create/'">
                        <span>Заказать услугу</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    servicesHtml += '</div>';
    container.innerHTML = servicesHtml;
    
    renderPagination(totalPages);
}

// ==========================================================================
// ПАГИНАЦИЯ
// ==========================================================================
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
    
    pagesHtml += '<div class="pagination-numbers">';
    
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        pagesHtml += `<div class="page-number" onclick="changePage(1)">1</div>`;
        if (startPage > 2) pagesHtml += `<span class="pagination-ellipsis">...</span>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pagesHtml += `<div class="page-number ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</div>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) pagesHtml += `<span class="pagination-ellipsis">...</span>`;
        pagesHtml += `<div class="page-number" onclick="changePage(${totalPages})">${totalPages}</div>`;
    }
    
    pagesHtml += '</div>';
    pagesHtml += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
    </button>`;
    
    paginationDiv.innerHTML = pagesHtml;
}

// ==========================================================================
// СМЕНА СТРАНИЦЫ
// ==========================================================================
function changePage(page) {
    const { totalPages } = getPaginatedServices();
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderServices();
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

// ==========================================================================
// 3D ЭФФЕКТ ПРИ НАВЕДЕНИИ НА КАРТОЧКУ
// ==========================================================================
function handleCardMove(event, card) {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
}

function handleCardLeave(card) {
    card.style.transform = '';
}

// ==========================================================================
// ПАРТИКЛЫ ДЛЯ ФОНА
// ==========================================================================
function createParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = Math.random() * 10 + 10 + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        container.appendChild(particle);
    }
}

// ==========================================================================
// АНИМАЦИЯ ПРИ СКРОЛЛЕ
// ==========================================================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => observer.observe(el));
}

// ==========================================================================
// ЗАГРУЗКА СТАТИСТИКИ (ОБЩАЯ)
// ==========================================================================
async function loadStats() {
    try {
        const response = await fetch('/leads/api/services/');
        const data = await response.json();
        if (data.services) {
            const statTotal = document.getElementById('statTotal');
            if (statTotal) statTotal.innerText = data.services.length;
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// ==========================================================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initScrollReveal();
    loadServices();
    loadStats();
});

// Экспорт для глобального использования (для onmousemove/onmouseleave в HTML)
window.handleCardMove = handleCardMove;
window.handleCardLeave = handleCardLeave;
window.changePage = changePage;