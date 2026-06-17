// lead_form.js - Скрипты для страницы создания заявки

// СОЗДАНИЕ ЧАСТИЦ
function createParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;
    
    for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = 10 + Math.random() * 10 + 's';
        particle.style.width = (Math.random() * 5 + 2) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// Экранирование HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Инициализация маски телефона
function initPhoneMask() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (!value.startsWith('7')) {
                if (value.startsWith('8')) value = '7' + value.slice(1);
                else if (value.startsWith('9')) value = '7' + value;
            }
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
}

// Валидация формы
function initFormValidation() {
    const form = document.getElementById('leadForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        const login = document.getElementById('login_name');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        
        if (!login.value.trim()) {
            e.preventDefault();
            alert('Введите логин');
            login.focus();
            return;
        }
        if (!email.value.trim() || !/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email.value)) {
            e.preventDefault();
            alert('Введите корректный email');
            email.focus();
            return;
        }
        if (!phone.value.trim()) {
            e.preventDefault();
            alert('Введите телефон');
            phone.focus();
            return;
        }
        
        const btn = document.getElementById('submitBtn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        btn.disabled = true;
    });
}

// Основной модуль для страницы заявки
const LeadForm = {
    servicesData: [],
    categoryNames: {
        'ads': 'Контекстная реклама',
        'target': 'Таргетинг',
        'seo': 'SEO',
        'smm': 'SMM продвижение',
        'dev': 'Разработка',
        'design': 'Дизайн',
        'context': 'Контекст'
    },
    currentCategory: 'all',
    selectedService: null,
    
    // Рендер категорий
    renderCategories: function() {
        const categories = new Map();
        categories.set('all', this.servicesData.length);
        this.servicesData.forEach(s => {
            const cat = s.category;
            categories.set(cat, (categories.get(cat) || 0) + 1);
        });
        
        let html = '<button class="cat-tab active" data-cat="all">Все услуги (' + categories.get('all') + ')</button>';
        for (let [cat, count] of categories) {
            if (cat !== 'all') {
                const catName = this.categoryNames[cat] || cat;
                html += `<button class="cat-tab" data-cat="${cat}">${catName} (${count})</button>`;
            }
        }
        document.getElementById('categoryTabs').innerHTML = html;
        
        document.querySelectorAll('.cat-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.cat;
                this.renderServices();
            });
        });
    },
    
    // Рендер услуг
    renderServices: function() {
        let filtered = this.currentCategory === 'all' ? this.servicesData : this.servicesData.filter(s => s.category === this.currentCategory);
        let html = '';
        filtered.forEach(service => {
            const isSelected = this.selectedService && this.selectedService.id === service.id;
            html += `
                <div class="service-item ${isSelected ? 'selected' : ''}" data-id="${service.id}" data-name="${escapeHtml(service.name)}" data-cat="${service.category}">
                    <div class="service-name">${escapeHtml(service.name)}</div>
                    <div class="service-cat">${this.categoryNames[service.category] || service.category}</div>
                </div>
            `;
        });
        const container = document.getElementById('servicesList');
        if (container) {
            container.innerHTML = html || '<div style="text-align:center;padding:30px;">Нет услуг</div>';
        }
        
        document.querySelectorAll('.service-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const name = item.dataset.name;
                this.selectService(id, name);
            });
        });
    },
    
    // Выбор услуги
    selectService: function(id, name) {
        this.selectedService = { id, name };
        
        document.querySelectorAll('.service-item').forEach(item => {
            if (parseInt(item.dataset.id) === id) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        document.getElementById('selectedServiceName').innerText = name;
        document.getElementById('selectedServiceId').value = id;
        document.getElementById('selectedServiceInfo').classList.add('show');
    },
    
    // Инициализация
    init: function(servicesData) {
        this.servicesData = servicesData;
        this.renderCategories();
        this.renderServices();
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initPhoneMask();
    initFormValidation();
    
    // Данные услуг передаются из шаблона Django
    if (typeof servicesData !== 'undefined') {
        LeadForm.init(servicesData);
    }
});