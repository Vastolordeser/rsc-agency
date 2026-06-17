// about.js - Скрипты для страницы "О нас"

// ==========================================================================
// АНИМАЦИЯ ЦИФР
// ==========================================================================
function animateNumbers() {
    const targets = [
        { element: document.getElementById('statYears'), target: 5 },
        { element: document.getElementById('statProjects'), target: 287 },
        { element: document.getElementById('statClients'), target: 52 },
        { element: document.getElementById('statSatisfaction'), target: 98 },
        { element: document.getElementById('statYears2'), target: 5 },
        { element: document.getElementById('statProjects2'), target: 287 },
        { element: document.getElementById('statClients2'), target: 52 },
        { element: document.getElementById('statSatisfaction2'), target: 98 }
    ];
    
    targets.forEach(({ element, target }) => {
        if (!element) return;
        let current = 0;
        const increment = target / 60;
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
    });
}

// ==========================================================================
// ПАРТИКЛЫ ДЛЯ ФОНА
// ==========================================================================
function createParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;
    
    for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = Math.random() * 12 + 10 + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.1;
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
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
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

// ==========================================================================
// 3D ЭФФЕКТ ПРИ НАВЕДЕНИИ НА КАРТОЧКИ
// ==========================================================================
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.stat-card, .value-card, .team-card, .testimonial-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
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
// АНИМАЦИЯ ДЛЯ ТАЙМЛАЙНА
// ==========================================================================
function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(item);
    });
}

// ==========================================================================
// ПАРТИКЛЫ ДЛЯ ГЕРОЯ (дополнительные)
// ==========================================================================
function createHeroParticles() {
    const hero = document.querySelector('.about-hero');
    if (!hero) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = '#b87333';
        particle.style.borderRadius = '50%';
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.bottom = '-20px';
        particle.style.animation = `floatUpHero ${Math.random() * 12 + 8}s linear infinite`;
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.pointerEvents = 'none';
        hero.appendChild(particle);
    }
    
    // Добавляем стили для анимации, если их нет
    if (!document.querySelector('#hero-particle-style')) {
        const style = document.createElement('style');
        style.id = 'hero-particle-style';
        style.textContent = `
            @keyframes floatUpHero {
                0% { transform: translateY(0); opacity: 0; }
                10% { opacity: 0.5; }
                90% { opacity: 0.5; }
                100% { transform: translateY(-100vh); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ==========================================================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    createHeroParticles();
    initScrollReveal();
    initCardHoverEffects();
    initSmoothScroll();
    initTimelineAnimation();
    
    // Запуск анимации цифр при появлении секции статистики
    const statsSection = document.querySelector('.stats-showcase');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumbers();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });
        observer.observe(statsSection);
    }
});