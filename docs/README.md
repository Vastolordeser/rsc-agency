# RSC Agency — АИС рекламного агентства

## Технологии
- Python 3.12
- Django 6.0.3
- SQLite
- HTML/CSS/JS

## Быстрый запуск
1. Клонируйте репозиторий: git clone https://github.com/Vastolordeser/rsc-agency.git
2. Перейти в папку проекта
3. Создайте виртуальное окружение: python -m venv venv
4. Создание папки для логов: mkdir logs
5. Активируйте: venv\Scripts\activate
6.1 Установите зависимости: pip install -r requirements.txt
6.2  Если проблемы с установкой зависимостей — используем зеркало: pip install --default-timeout=300 -i https://mirrors.huaweicloud.com/repository/pypi/simple -r requirements.txt
8. Применение миграций: python manage.py migrate
9. Запустите сервер: python manage.py runserver


## Доступные адреса
- Сайт: http://127.0.0.1:8000/
- Админ-панель: http://127.0.0.1:8000/leads/admin/dashboard/

## Контакты
По всем вопросам обращайтесь к разработчику.
