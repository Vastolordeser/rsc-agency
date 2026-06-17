// index.js - Скрипты для главной страницы

// ========== ПАРТИКЛЫ ДЛЯ ФОНА ==========
function createParticles() {
    const particlesContainer = document.querySelector('.bg-particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = Math.random() * 10 + 5 + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        particlesContainer.appendChild(particle);
    }
}

// ========== КАРУСЕЛЬ ОТЗЫВОВ ==========
let currentSlide = 0;
let slides = [];
let dots = [];
let autoSlideInterval = null;

function initTestimonialsCarousel() {
    slides = document.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!slides.length || !dotsContainer) return;
    
    // Создаём точки навигации
    function createDots() {
        dotsContainer.innerHTML = '';
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'dot' + (index === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
            dots.push(dot);
        });
    }
    
    // Переход к определённому слайду
    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        slides[currentSlide]?.classList.remove('active');
        dots[currentSlide]?.classList.remove('active');
        
        currentSlide = index;
        
        slides[currentSlide]?.classList.add('active');
        dots[currentSlide]?.classList.add('active');
    }
    
    // Следующий слайд
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    // Запуск автопрокрутки
    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, 8000);
    }
    
    // Остановка автопрокрутки при наведении
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }
    
    createDots();
    startAutoSlide();
    
    const carousel = document.querySelector('.testimonials-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
    }
}

// ========== АНИМАЦИЯ ПРИ СКРОЛЛЕ ==========
function initScrollAnimations() {
    const cards = document.querySelectorAll('.feature-card, .service-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

// ========== ЭФФЕКТ ПРИ НАВЕДЕНИИ НА КАРТОЧКИ ==========
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.feature-card, .service-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// ========== АНИМАЦИЯ ГРАДИЕНТА В HERO ==========
function initHeroGradientAnimation() {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        heroTitle.style.backgroundSize = '200% 200%';
        heroTitle.style.animation = 'gradientShift 3s ease infinite';
    }
}

// ========== ВАЛИДАЦИЯ ФОРМЫ ПОДПИСКИ ==========
function initSubscribeForm() {
    const form = document.querySelector('.cta-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        const emailInput = this.querySelector('input[type="email"]');
        if (!emailInput) return;
        
        const email = emailInput.value.trim();
        if (!email) {
            e.preventDefault();
            showToast('Введите email', 'error');
            emailInput.focus();
            return;
        }
        
        if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email)) {
            e.preventDefault();
            showToast('Введите корректный email', 'error');
            emailInput.focus();
            return;
        }
        
        const submitBtn = this.querySelector('button');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Подписка...';
            submitBtn.disabled = true;
        }
    });
}

// ========== TOAST УВЕДОМЛЕНИЯ ==========
function showToast(message, type = 'info') {
    // Удаляем старый toast
    const oldToast = document.querySelector('.custom-toast');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 12px 24px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        border-radius: 12px;
        font-size: 14px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    toast.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Добавляем стили для анимации toast
function addToastStyles() {
    if (document.querySelector('#toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// ========== ПЛАВНАЯ ПРОКРУТКА К ЯКОРЯМ ==========
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

// ========== СЧЁТЧИКИ СТАТИСТИКИ (если есть на странице) ==========
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
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
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.innerText = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.innerText = target;
        }
    };
    updateCounter();
}

// ========== ОБРАБОТКА СООБЩЕНИЙ (DJANGO MESSAGES) ==========
function initDjangoMessages() {
    const messages = document.querySelectorAll('.messages .alert');
    messages.forEach(msg => {
        setTimeout(() => {
            msg.style.opacity = '0';
            msg.style.transition = 'opacity 0.5s';
            setTimeout(() => msg.remove(), 500);
        }, 5000);
    });
}

// ========== ПАРАЛЛАКС ЭФФЕКТ ДЛЯ ГЕРОЯ ==========
function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const bgGradient = document.querySelector('.bg-gradient');
        if (bgGradient) {
            bgGradient.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initTestimonialsCarousel();
    initScrollAnimations();
    initCardHoverEffects();
    initHeroGradientAnimation();
    initSubscribeForm();
    addToastStyles();
    initSmoothScroll();
    initCounters();
    initDjangoMessages();
    initParallax();
});