// service_detail.js - Скрипты для детальной страницы услуги

// Анимация появления элементов
function animateServiceDetail() {
    const header = document.querySelector('.service-detail-header');
    const content = document.querySelector('.service-detail-content');
    const cta = document.querySelector('.service-cta');
    
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(30px)';
        setTimeout(() => {
            header.style.transition = 'all 0.5s ease';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }
    
    if (content) {
        content.style.opacity = '0';
        content.style.transform = 'translateY(30px)';
        setTimeout(() => {
            content.style.transition = 'all 0.5s ease 0.15s';
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        }, 150);
    }
    
    if (cta) {
        cta.style.opacity = '0';
        cta.style.transform = 'translateY(30px)';
        setTimeout(() => {
            cta.style.transition = 'all 0.5s ease 0.3s';
            cta.style.opacity = '1';
            cta.style.transform = 'translateY(0)';
        }, 300);
    }
}

// Эффект свечения для кнопок при наведении
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn, .btn-secondary');
    
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-3px)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
        });
    });
}

// Плавная загрузка изображения
function initLazyImage() {
    const img = document.querySelector('.service-icon-large img');
    if (img) {
        img.style.opacity = '0';
        img.addEventListener('load', () => {
            img.style.transition = 'opacity 0.5s ease';
            img.style.opacity = '1';
        });
        if (img.complete) {
            img.style.opacity = '1';
        }
    }
}

// Добавление частиц на фон (опционально)
function createParticles() {
    const bg = document.querySelector('.service-detail');
    if (!bg) return;
    
    // Проверяем, есть ли уже частицы
    if (document.querySelector('.service-particle')) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'service-particle';
        particle.style.cssText = `
            position: fixed;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: #b87333;
            border-radius: 50%;
            opacity: ${Math.random() * 0.3 + 0.1};
            left: ${Math.random() * 100}%;
            bottom: -20px;
            pointer-events: none;
            z-index: -1;
            animation: floatUp ${Math.random() * 15 + 10}s linear infinite;
            animation-delay: ${Math.random() * 10}s;
        `;
        bg.appendChild(particle);
    }
    
    // Добавляем стили для анимации, если их нет
    if (!document.querySelector('#particle-style')) {
        const style = document.createElement('style');
        style.id = 'particle-style';
        style.textContent = `
            @keyframes floatUp {
                0% { transform: translateY(0); opacity: 0; }
                10% { opacity: 0.5; }
                90% { opacity: 0.5; }
                100% { transform: translateY(-100vh); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Отправка аналитики просмотра услуги (если нужно)
function sendServiceViewAnalytics() {
    const serviceName = document.querySelector('.service-detail-header h1')?.innerText;
    if (serviceName && typeof gtag !== 'undefined') {
        gtag('event', 'view_item', {
            'send_to': 'AW-CONVERSION_ID',
            'items': [{ 'item_name': serviceName }]
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    animateServiceDetail();
    initButtonEffects();
    initLazyImage();
    createParticles();
    sendServiceViewAnalytics();
});