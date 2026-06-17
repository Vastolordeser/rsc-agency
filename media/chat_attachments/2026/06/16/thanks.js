// thanks.js - Скрипты для страницы благодарности

// Анимация появления
function animateThanks() {
    const title = document.querySelector('.thanks h1');
    const text = document.querySelector('.thanks p');
    const btn = document.querySelector('.thanks .btn');
    
    if (title) {
        title.style.opacity = '0';
        title.style.transform = 'translateY(20px)';
        title.style.transition = 'all 0.5s ease';
        setTimeout(() => {
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
        }, 100);
    }
    
    if (text) {
        text.style.opacity = '0';
        text.style.transform = 'translateY(20px)';
        text.style.transition = 'all 0.5s ease 0.15s';
        setTimeout(() => {
            text.style.opacity = '1';
            text.style.transform = 'translateY(0)';
        }, 150);
    }
    
    if (btn) {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(20px)';
        btn.style.transition = 'all 0.5s ease 0.3s';
        setTimeout(() => {
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        }, 300);
    }
}

// Добавление эффекта пульсации на кнопку
function addButtonEffect() {
    const btn = document.querySelector('.thanks .btn');
    if (btn) {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-3px)';
            btn.style.gap = '15px';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.gap = '10px';
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    animateThanks();
    addButtonEffect();
    
    // Отправка аналитики (если есть)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            'send_to': 'AW-CONVERSION_ID/form_submit'
        });
    }
});