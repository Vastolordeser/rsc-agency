# Установка и запуск RSC Agency

## Системные требования
- Python 3.12 или выше
- 500 MB свободного дискового пространства
- Доступ к интернету для установки зависимостей

## Пошаговая установка

### 1. Клонирование репозитория
```bash
git clone https://github.com/Vastolordeser/rsc-agency.git
cd rsc-agency


### 2. Создание и активация виртуального окружения
```bash
python -m venv venv
venv\Scripts\activate

### 3. Создание папки для логов
```bash
mkdir logs

### 4. Установка зависимостей
```bash
pip install -r requirements.txt
При проблемах с интернетом (таймауты), используйте зеркало:
pip install --default-timeout=300 -i https://mirrors.huaweicloud.com/repository/pypi/simple -r requirements.txt

### 5. Применение миграций
```bash
python manage.py migrate

### 6. Запуск сервера
```bash
python manage.py runserver


## Доступ
| Страница | URL |
|----------|-----|
| Сайт | http://127.0.0.1:8000/ |
| Админ-панель | http://127.0.0.1:8000/leads/admin/dashboard/ |
| Вход | http://127.0.0.1:8000/users/login/ |
| Регистрация | http://127.0.0.1:8000/users/register/ |
