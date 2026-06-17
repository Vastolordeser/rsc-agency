from django.db import models

class Lead(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новая'),
        ('processing', 'В обработке'),
        ('completed', 'Завершена'),
        ('rejected', 'Отклонена'),
    ]
    name = models.CharField(max_length=200, verbose_name="Имя")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=50, verbose_name="Телефон")
    message = models.TextField(blank=True, verbose_name="Сообщение")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    service = models.ForeignKey('Service', on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Стоимость")
    user = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="leads")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'requests'
        verbose_name = "Заявка"
        verbose_name_plural = "Заявки"

    def __str__(self):
        return f"{self.name} - {self.created_at.strftime('%d.%m.%Y %H:%M')}"


class Service(models.Model):
    CATEGORY_CHOICES = [
        ('ads', 'Контекстная реклама'),
        ('target', 'Таргетинг'),
        ('seo', 'SEO'),
        ('smm', 'SMM'),
        ('dev', 'Разработка'),
        ('design', 'Дизайн'),
    ]
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    price = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    image = models.ImageField(upload_to='services/', blank=True, null=True)
    features = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('AdminUser', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Кто создал")

    class Meta:
        db_table = 'services'
        verbose_name = "Услуга"
        verbose_name_plural = "Услуги"

    def __str__(self):
        return self.name


class Project(models.Model):
    CATEGORY_CHOICES = [
        ('web', 'Веб-разработка'),
        ('marketing', 'Маркетинг'),
        ('design', 'Дизайн'),
        ('smm', 'SMM продвижение'),
        ('seo', 'SEO'),
        ('other', 'Другое'),
    ]
    STATUS_CHOICES = [
        ('active', 'Активен'),
        ('inactive', 'Неактивен'),
        ('completed', 'Завершён'),
    ]
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    client = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    result = models.CharField(max_length=200, blank=True, null=True)
    link = models.CharField(max_length=200, blank=True, null=True)
    sort_order = models.IntegerField(default=0, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('AdminUser', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Кто создал")

    class Meta:
        db_table = 'portfolio_projects'
        verbose_name = "Проект"
        verbose_name_plural = "Проекты"

    def __str__(self):
        return self.name


class Client(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, null=True, blank=True, related_name='client_profile')
    
    first_name = models.CharField(max_length=200, verbose_name="Имя")
    last_name = models.CharField(max_length=200, verbose_name="Фамилия", blank=True, default='')
    patronymic = models.CharField(max_length=200, verbose_name="Отчество", blank=True, default='')
    
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=50, verbose_name="Телефон")
    company = models.CharField(max_length=200, blank=True, verbose_name="Компания")
    position = models.CharField(max_length=100, blank=True, verbose_name="Должность")
    city = models.CharField(max_length=100, blank=True, verbose_name="Город")
    website = models.URLField(blank=True, verbose_name="Сайт")
    address = models.TextField(blank=True, verbose_name="Адрес")
    bio = models.TextField(blank=True, verbose_name="О себе")
    avatar = models.ImageField(upload_to='clients/avatars/', blank=True, null=True, verbose_name="Аватар")
    total_orders = models.IntegerField(default=0, verbose_name="Всего заказов")
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Потрачено")
    last_activity = models.DateTimeField(auto_now=True, verbose_name="Последняя активность")
    is_blocked = models.BooleanField(default=False, verbose_name="Заблокирован")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        db_table = 'clients'
        verbose_name = "Клиент"
        verbose_name_plural = "Клиенты"
        ordering = ['-created_at']

    def __str__(self):
        if self.last_name and self.first_name:
            return f"{self.last_name} {self.first_name}".strip()
        return self.first_name or self.email

    def update_total_spent(self):
        from .models import Lead
        total = Lead.objects.filter(user=self.user, status='completed').aggregate(
            total=models.Sum('price')
        )['total'] or 0
        self.total_spent = total
        self.save(update_fields=['total_spent'])
    
    def extract_price_number(self, price_str):
        """Извлекает число из строки цены (например, 'от 30 000 ₽' -> 30000)"""
        if not price_str:
            return None
        import re
        numbers = re.findall(r'[\d\s]+', price_str)
        if numbers:
            clean = numbers[0].replace(' ', '')
            try:
                return float(clean)
            except:
                return None
        return None

    @property
    def full_name(self):
        parts = []
        if self.last_name:
            parts.append(self.last_name)
        if self.first_name:
            parts.append(self.first_name)
        if self.patronymic:
            parts.append(self.patronymic)
        return ' '.join(parts)
    
    @property
    def username(self):
        if self.user:
            return self.user.username
        return ''
    
    @property
    def name(self):
        if self.last_name and self.first_name:
            return f"{self.last_name} {self.first_name}".strip()
        return self.first_name or self.email

    @property
    def online_status(self):
        from django.utils import timezone
        from datetime import timedelta
        
        if self.is_blocked:
            return 'blocked'
        
        if not self.last_activity:
            return 'offline'
        
        delta = timezone.now() - self.last_activity
        
        if delta.total_seconds() < 300:
            return 'online'
        elif delta.total_seconds() < 7776000:
            return 'offline'
        else:
            return 'inactive'


class Notification(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    type = models.CharField(max_length=50, default='system', verbose_name="Тип уведомления")
    link = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        verbose_name = "Уведомление"
        verbose_name_plural = "Уведомления"

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50, verbose_name="Телефон")
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)
    
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Отправитель")
    replied_by = models.ForeignKey('AdminUser', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Ответил", related_name='replied_messages')
    reply_text = models.TextField(blank=True, verbose_name="Текст ответа")
    replied_at = models.DateTimeField(blank=True, null=True, verbose_name="Дата ответа")

    def __str__(self):
        return f"Сообщение от {self.name} ({self.created_at.strftime('%d.%m.%Y %H:%M')})"


class LeadHistory(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=50, verbose_name="Действие")
    old_status = models.CharField(max_length=20, blank=True, verbose_name="Старый статус")
    new_status = models.CharField(max_length=20, blank=True, verbose_name="Новый статус")
    comment = models.TextField(blank=True, verbose_name="Комментарий")
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Кто изменил")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата изменения")

    class Meta:
        db_table = 'request_history'
        verbose_name = "История заявки"
        verbose_name_plural = "Истории заявок"

    def __str__(self):
        return f"{self.lead.name} - {self.action} - {self.created_at.strftime('%d.%m.%Y %H:%M')}"


class MessageAttachment(models.Model):
    message = models.ForeignKey(LeadHistory, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='chat_attachments/%Y/%m/%d/', verbose_name="Файл")
    filename = models.CharField(max_length=255, verbose_name="Имя файла")
    file_size = models.IntegerField(default=0, verbose_name="Размер файла")
    file_type = models.CharField(max_length=100, blank=True, verbose_name="Тип файла")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'message_attachments'
        verbose_name = "Вложение"
        verbose_name_plural = "Вложения"

    def __str__(self):
        return self.filename


class AdminUser(models.Model):
    PERMISSION_CHOICES = [
        ('full', 'Полные права (всё может)'),
        ('view_only', 'Только просмотр (не может изменять)'),
        ('leads_only', 'Только заявки'),
        ('clients_only', 'Только клиенты'),
    ]
    
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='admin_profile',
        verbose_name="Пользователь"
    )
    
    username = models.CharField(max_length=150, unique=True, verbose_name="Логин")
    email = models.EmailField(unique=True, verbose_name="Email")
    password_hash = models.CharField(max_length=255, verbose_name="Пароль (хэш)")
    first_name = models.CharField(max_length=150, blank=True, verbose_name="Имя")
    last_name = models.CharField(max_length=150, blank=True, verbose_name="Фамилия")
    patronymic = models.CharField(max_length=150, blank=True, verbose_name="Отчество")
    position = models.CharField(max_length=200, blank=True, verbose_name="Должность")
    permissions = models.CharField(max_length=20, choices=PERMISSION_CHOICES, default='view_only', verbose_name="Права")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    avatar = models.ImageField(upload_to='admin_avatars/', blank=True, null=True, verbose_name="Аватар")
    last_login = models.DateTimeField(blank=True, null=True, verbose_name="Последний вход")
    last_logout = models.DateTimeField(blank=True, null=True, verbose_name="Последний выход")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        db_table = 'admins'
        verbose_name = "Сотрудник"
        verbose_name_plural = "Сотрудники"
        ordering = ['-created_at']
    
    @property
    def is_online(self):
        if not self.last_login:
            return False
        if self.last_logout and self.last_logout > self.last_login:
            return False
        from django.utils import timezone
        delta = timezone.now() - self.last_login
        return delta.total_seconds() < 300
    
    @property
    def full_name(self):
        parts = []
        if self.last_name:
            parts.append(self.last_name)
        if self.first_name:
            parts.append(self.first_name)
        if self.patronymic:
            parts.append(self.patronymic)
        return ' '.join(parts) or self.username
    
    def __str__(self):
        return self.full_name
    
    