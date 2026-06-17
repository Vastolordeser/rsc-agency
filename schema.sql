# Структура базы данных RSC Agency

**СУБД:** SQLite  
**Файл:** db.sqlite3  

---

## Таблицы

### 1. Таблица `users` (Пользователи)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| username | VARCHAR(150) | Логин (уникальный) |
| password | VARCHAR(128) | Хеш пароля |
| email | VARCHAR(254) | Email |
| first_name | VARCHAR(150) | Имя |
| last_name | VARCHAR(150) | Фамилия |
| phone | VARCHAR(20) | Телефон |
| is_staff | BOOLEAN | Сотрудник (доступ в админку) |
| is_superuser | BOOLEAN | Суперпользователь |
| is_active | BOOLEAN | Активен |
| last_login | DATETIME | Последний вход |
| date_joined | DATETIME | Дата регистрации |

**Связи:**
- 1:1 → `clients` (client_profile)
- 1:1 → `admins` (admin_profile)
- 1:N → `requests` (leads)
- 1:N → `notifications` (notifications)
- 1:N → `request_history` (created_by)
- 1:N → `leads_contactmessage` (user)

---

### 2. Таблица `admins` (Сотрудники)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| user_id | BIGINT | Внешний ключ → `users.id` (1:1) |
| username | VARCHAR(150) | Логин (уникальный) |
| email | VARCHAR(254) | Email (уникальный) |
| password_hash | VARCHAR(255) | Хеш пароля |
| first_name | VARCHAR(150) | Имя |
| last_name | VARCHAR(150) | Фамилия |
| patronymic | VARCHAR(150) | Отчество |
| position | VARCHAR(200) | Должность |
| permissions | VARCHAR(20) | Права (full/view_only/leads_only/clients_only) |
| is_active | BOOLEAN | Активен |
| avatar | VARCHAR(100) | Аватар |
| last_login | DATETIME | Последний вход |
| last_logout | DATETIME | Последний выход |
| created_at | DATETIME | Дата создания |
| updated_at | DATETIME | Дата обновления |

**Связи:**
- 1:1 → `users` (user_id)
- 1:N → `services` (created_by)
- 1:N → `portfolio_projects` (created_by)
- 1:N → `leads_contactmessage` (replied_by)

---

### 3. Таблица `clients` (Клиенты)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| user_id | BIGINT | Внешний ключ → `users.id` (1:1) |
| first_name | VARCHAR(200) | Имя |
| last_name | VARCHAR(200) | Фамилия |
| patronymic | VARCHAR(200) | Отчество |
| email | VARCHAR(254) | Email |
| phone | VARCHAR(50) | Телефон |
| company | VARCHAR(200) | Компания |
| position | VARCHAR(100) | Должность |
| city | VARCHAR(100) | Город |
| website | VARCHAR(200) | Сайт |
| address | TEXT | Адрес |
| bio | TEXT | О себе |
| avatar | VARCHAR(100) | Аватар |
| total_orders | INTEGER | Всего заказов |
| total_spent | DECIMAL | Потрачено |
| last_activity | DATETIME | Последняя активность |
| is_blocked | BOOLEAN | Заблокирован |
| created_at | DATETIME | Дата создания |
| updated_at | DATETIME | Дата обновления |

**Связи:**
- 1:1 → `users` (user_id)

---

### 4. Таблица `requests` (Заявки)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| user_id | BIGINT | Внешний ключ → `users.id` |
| service_id | BIGINT | Внешний ключ → `services.id` |
| name | VARCHAR(200) | Имя клиента |
| email | VARCHAR(254) | Email |
| phone | VARCHAR(50) | Телефон |
| message | TEXT | Сообщение |
| status | VARCHAR(20) | Статус (new/processing/completed/rejected) |
| price | DECIMAL | Стоимость |
| created_at | DATETIME | Дата создания |
| updated_at | DATETIME | Дата обновления |

**Связи:**
- N:1 → `users` (user_id)
- N:1 → `services` (service_id)
- 1:N → `request_history` (lead_id)

---

### 5. Таблица `services` (Услуги)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| name | VARCHAR(200) | Название |
| category | VARCHAR(20) | Категория |
| price | VARCHAR(100) | Цена |
| description | TEXT | Описание |
| is_active | BOOLEAN | Активна |
| order | INTEGER | Порядок сортировки |
| image | VARCHAR(100) | Изображение |
| features | TEXT | Особенности |
| created_at | DATETIME | Дата создания |
| updated_at | DATETIME | Дата обновления |
| created_by_id | INTEGER | Внешний ключ → `admins.id` |

**Связи:**
- N:1 → `admins` (created_by)
- 1:N → `requests` (service_id)

---

### 6. Таблица `portfolio_projects` (Проекты портфолио)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| name | VARCHAR(200) | Название |
| client | VARCHAR(200) | Клиент |
| description | TEXT | Описание |
| image | VARCHAR(100) | Изображение |
| is_active | BOOLEAN | Активен |
| category | VARCHAR(50) | Категория |
| link | VARCHAR(200) | Ссылка |
| result | VARCHAR(200) | Результат |
| sort_order | INTEGER | Порядок сортировки |
| status | VARCHAR(20) | Статус (active/inactive/completed) |
| created_at | DATETIME | Дата создания |
| created_by_id | INTEGER | Внешний ключ → `admins.id` |

**Связи:**
- N:1 → `admins` (created_by)

---

### 7. Таблица `request_history` (История заявок)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| lead_id | BIGINT | Внешний ключ → `requests.id` |
| action | VARCHAR(50) | Действие |
| old_status | VARCHAR(20) | Старый статус |
| new_status | VARCHAR(20) | Новый статус |
| comment | TEXT | Комментарий |
| created_at | DATETIME | Дата изменения |
| created_by_id | BIGINT | Внешний ключ → `users.id` |

**Связи:**
- N:1 → `requests` (lead_id)
- N:1 → `users` (created_by)
- 1:N → `message_attachments` (message_id)

---

### 8. Таблица `notifications` (Уведомления)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| user_id | BIGINT | Внешний ключ → `users.id` |
| title | VARCHAR(200) | Заголовок |
| message | TEXT | Текст |
| is_read | BOOLEAN | Прочитано |
| type | VARCHAR(50) | Тип (system/status_change/reply/client_reply) |
| link | VARCHAR(200) | Ссылка |
| created_at | DATETIME | Дата создания |

**Связи:**
- N:1 → `users` (user_id)

---

### 9. Таблица `message_attachments` (Вложения в чате)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| message_id | BIGINT | Внешний ключ → `request_history.id` |
| file | VARCHAR(100) | Путь к файлу |
| filename | VARCHAR(255) | Имя файла |
| file_size | INTEGER | Размер в байтах |
| file_type | VARCHAR(100) | Тип файла |
| created_at | DATETIME | Дата создания |

**Связи:**
- N:1 → `request_history` (message_id)

---

### 10. Таблица `leads_contactmessage` (Сообщения с сайта)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| user_id | BIGINT | Внешний ключ → `users.id` |
| replied_by_id | BIGINT | Внешний ключ → `admins.id` |
| name | VARCHAR(200) | Имя |
| email | VARCHAR(254) | Email |
| phone | VARCHAR(50) | Телефон |
| message | TEXT | Сообщение |
| is_processed | BOOLEAN | Обработано |
| reply_text | TEXT | Текст ответа |
| replied_at | DATETIME | Дата ответа |
| created_at | DATETIME | Дата создания |

**Связи:**
- N:1 → `users` (user_id)
- N:1 → `admins` (replied_by)

---

### Служебные таблицы Django

| Таблица | Назначение |
|---------|------------|
| auth_permission | Права доступа |
| django_admin_log | Логи действий в админке Django |
| django_content_type | Типы контента |
| django_migrations | История миграций |
| django_session | Сессии пользователей |
| sqlite_sequence | Служебная таблица SQLite |

---

## Схема связей
