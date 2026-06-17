# Структура базы данных RSC Agency

**СУБД:** SQLite
**Файл:** db.sqlite3


## Таблица users (пользователи)

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
| is_active | BOOLEAN | Активен |
| is_superuser | BOOLEAN | Суперпользователь |
| last_login | DATETIME | Последний вход |
| date_joined | DATETIME | Дата регистрации |

---

## Таблица clients (клиенты)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| user_id | BIGINT | FK → users.id (связь 1:1) |
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
| is_blocked | BOOLEAN | Заблокирован |
| last_activity | DATETIME | Последняя активность |
| created_at | DATETIME | Дата создания |
| updated_at | DATETIME | Дата обновления |

---

## Таблица requests (заявки)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| user_id | BIGINT | FK → users.id |
| service_id | BIGINT | FK → services.id |
| name | VARCHAR(200) | Имя |
| email | VARCHAR(254) | Email |
| phone | VARCHAR(50) | Телефон |
| message | TEXT | Сообщение |
| status | VARCHAR(20) | Статус (new/processing/completed/rejected) |
| price | DECIMAL | Цена |
| created_at | DATETIME | Дата создания |
| updated_at | DATETIME | Дата обновления |

---

## Таблица services (услуги)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| name | VARCHAR(200) | Название |
| category | VARCHAR(20) | Категория (ads/target/seo/smm/dev/design) |
| price | VARCHAR(100) | Цена |
| description | TEXT | Описание |
| features | TEXT | Особенности |
| image | VARCHAR(100) | Изображение |
| order | INTEGER | Порядок сортировки |
| is_active | BOOLEAN | Активна |
| created_at | DATETIME | Дата создания |
| updated_at | DATETIME | Дата обновления |
| created_by_id | INTEGER | FK → admins.id (кто создал) |

---

## Таблица portfolio_projects (портфолио)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| name | VARCHAR(200) | Название проекта |
| client | VARCHAR(200) | Клиент |
| description | TEXT | Описание |
| image | VARCHAR(100) | Изображение |
| category | VARCHAR(50) | Категория |
| link | VARCHAR(200) | Ссылка |
| result | VARCHAR(200) | Результат |
| status | VARCHAR(20) | Статус (active/inactive/completed) |
| sort_order | INTEGER | Порядок сортировки |
| is_active | BOOLEAN | Активен |
| created_at | DATETIME | Дата создания |
| created_by_id | INTEGER | FK → admins.id (кто создал) |

---

## Таблица admins (администраторы)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| username | VARCHAR(150) | Логин (уникальный) |
| email | VARCHAR(254) | Email (уникальный) |
| password_hash | VARCHAR(255) | Хеш пароля |
| position | VARCHAR(200) | Должность |
| permissions | VARCHAR(20) | Права (full/view_only/leads_only/clients_only) |
| avatar | VARCHAR(100) | Аватар |
| is_active | BOOLEAN | Активен |
| last_login | DATETIME | Последний вход |
| last_logout | DATETIME | Последний выход |
| created_at | DATETIME | Дата создания |
| updated_at | DATETIME | Дата обновления |

---

## Таблица notifications (уведомления)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| user_id | BIGINT | FK → users.id |
| title | VARCHAR(200) | Заголовок |
| message | TEXT | Текст |
| link | VARCHAR(200) | Ссылка |
| type | VARCHAR(50) | Тип (system/status_change/reply/client_reply) |
| is_read | BOOLEAN | Прочитано |
| created_at | DATETIME | Дата создания |

---

## Таблица request_history (история заявок)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| lead_id | BIGINT | FK → requests.id |
| action | VARCHAR(50) | Действие (change_status/admin_reply/client_reply) |
| old_status | VARCHAR(20) | Старый статус |
| new_status | VARCHAR(20) | Новый статус |
| comment | TEXT | Комментарий |
| created_at | DATETIME | Дата создания |
| created_by_id | BIGINT | FK → users.id (кто сделал) |

---

## Таблица message_attachments (вложения чата)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| message_id | BIGINT | FK → request_history.id |
| file | VARCHAR(100) | Путь к файлу |
| filename | VARCHAR(255) | Имя файла |
| file_size | INTEGER | Размер в байтах |
| file_type | VARCHAR(100) | Тип файла |
| created_at | DATETIME | Дата создания |

---

## Таблица leads_contactmessage (сообщения с сайта)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| user_id | BIGINT | FK → users.id |
| name | VARCHAR(200) | Имя |
| email | VARCHAR(254) | Email |
| phone | VARCHAR(50) | Телефон |
| message | TEXT | Сообщение |
| reply_text | TEXT | Текст ответа |
| is_processed | BOOLEAN | Обработано |
| replied_at | DATETIME | Дата ответа |
| replied_by_id | BIGINT | FK → admins.id (кто ответил) |
| created_at | DATETIME | Дата создания |

---

## Таблицы Django (служебные)

| Таблица | Назначение |
|---------|------------|
| auth_permission | Права доступа |
| django_admin_log | Логи действий в админке Django |
| django_content_type | Типы контента |
| django_migrations | История миграций |
| django_session | Сессии пользователей |
| sqlite_sequence | Служебная таблица SQLite |