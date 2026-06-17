// contacts.js - Скрипты для страницы Контакты

// ==========================================================================
// ИНИЦИАЛИЗАЦИЯ КАРТЫ
// ==========================================================================
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Координаты офиса (Москва, Тверская)
    const officeLat = 55.760186;
    const officeLng = 37.613891;
    
    const map = L.map('map').setView([officeLat, officeLng], 16);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd'
    }).addTo(map);
    
    const customIcon = L.divIcon({
        html: '<div style="background: #b87333; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(184,115,51,0.8);"><i class="fas fa-map-marker-alt" style="color: white; font-size: 22px;"></i></div>',
        iconSize: [45, 45],
        popupAnchor: [0, -22]
    });
    
    L.marker([officeLat, officeLng], { icon: customIcon })
        .addTo(map)
        .bindPopup('<b>RSC Agency</b><br/>г. Москва, ул. Тверская, д. 1')
        .openPopup();
    
    // Добавляем анимацию при загрузке карты
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

// ==========================================================================
// FAQ АККОРДЕОН
// ==========================================================================
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            // Закрываем другие открытые элементы
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });
}

// ==========================================================================
// ПАРТИКЛЫ ДЛЯ ФОНА
// ==========================================================================
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = Math.random() * 12 + 6 + 's';
        particle.style.opacity = Math.random() * 0.4 + 0.1;
        container.appendChild(particle);
    }
}

// ==========================================================================
// ВАЛИДАЦИЯ ФОРМЫ
// ==========================================================================
function initFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        const name = this.querySelector('[name="name"]');
        const email = this.querySelector('[name="email"]');
        const phone = this.querySelector('[name="phone"]');
        const message = this.querySelector('[name="message"]');
        
        // Очищаем предыдущие ошибки
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        document.querySelectorAll('.form-group input, .form-group textarea').forEach(el => {
            el.style.borderColor = '';
        });
        
        let hasError = false;
        
        if (!name.value.trim()) {
            showFieldError(name, 'Введите имя');
            hasError = true;
        }
        
        if (!email.value.trim()) {
            showFieldError(email, 'Введите email');
            hasError = true;
        } else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email.value)) {
            showFieldError(email, 'Введите корректный email');
            hasError = true;
        }
        
        if (!phone.value.trim()) {
            showFieldError(phone, 'Введите телефон');
            hasError = true;
        }
        
        if (!message.value.trim()) {
            showFieldError(message, 'Введите сообщение');
            hasError = true;
        }
        
        if (hasError) {
            e.preventDefault();
        } else {
            // Показываем индикатор загрузки
            const submitBtn = form.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
                submitBtn.disabled = true;
            }
        }
    });
}

function showFieldError(field, message) {
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

// ==========================================================================
// АНИМАЦИЯ ПРИ НАВЕДЕНИИ НА КАРТОЧКИ
// ==========================================================================
function initCardEffects() {
    const cards = document.querySelectorAll('.contact-card, .social-icon');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// ==========================================================================
// МАСКА ТЕЛЕФОНА
// ==========================================================================
function initPhoneMask() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 0) {
            let formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.slice(1, 4);
            if (value.length > 4) formatted += ') ' + value.slice(4, 7);
            if (value.length > 7) formatted += '-' + value.slice(7, 9);
            if (value.length > 9) formatted += '-' + value.slice(9, 11);
            e.target.value = formatted;
        } else {
            e.target.value = '';
        }
    });
}

// ==========================================================================
// АНИМАЦИЯ СЧЁТЧИКОВ (для статистики)
// ==========================================================================
function initCounters() {
    const counters = document.querySelectorAll('.hero-stat-number');
    if (!counters.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.innerText);
                if (target && !counter.hasAttribute('data-counted')) {
                    counter.setAttribute('data-counted', 'true');
                    animateCounter(counter, target);
                }
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const update = () => {
        current += increment;
        if (current < target) {
            element.innerText = Math.floor(current);
            requestAnimationFrame(update);
        } else {
            element.innerText = target;
        }
    };
    update();
}

// ==========================================================================
// ПЛАВНАЯ ПРОКРУТКА К ЯКОРЯМ
// ==========================================================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==========================================================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем карту с небольшой задержкой
    setTimeout(() => {
        if (typeof L !== 'undefined') {
            initMap();
        } else {
            console.warn('Leaflet не загружен');
        }
    }, 100);
    
    createParticles();
    initFaqAccordion();
    initFormValidation();
    initCardEffects();
    initPhoneMask();
    initCounters();
    initSmoothScroll();
});