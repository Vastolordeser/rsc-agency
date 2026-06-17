from django.shortcuts import redirect
from django.contrib import messages
from .models import AdminUser

def permission_required(allowed_permissions):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):

            if not request.user.is_authenticated:
                messages.error(request, 'Необходимо войти в систему')
                return redirect('login')

            if not request.user.is_staff:
                messages.error(request, 'У вас нет доступа к этой странице')
                return redirect('index')

            try:
                admin_user = request.user.admin_profile
                user_permissions = admin_user.permissions
            except AdminUser.DoesNotExist:
                messages.error(request, 'Ошибка: профиль сотрудника не найден')
                return redirect('index')
            
            # Проверяем, есть ли у сотрудника доступ
            if user_permissions == 'full':
                # Полный доступ — разрешаем всё
                return view_func(request, *args, **kwargs)
            
            if user_permissions not in allowed_permissions:
                messages.error(request, 'У вас недостаточно прав для выполнения этого действия')
                return redirect('admin_dashboard')
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator