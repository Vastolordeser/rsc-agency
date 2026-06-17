from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.utils import timezone
import secrets
import os
from ..models import AdminUser, Client
from ..decorators import permission_required

User = get_user_model()

@permission_required(['full'])
def admin_employees(request):
    employees = AdminUser.objects.all().order_by('-created_at')
    total = employees.count()
    active = employees.filter(is_active=True).count()

    return render(request, 'admin_panel/employees/list.html', {
        'employees': employees,
        'stats': {
            'total': total,
            'active': active,
        }
    })

@permission_required(['full'])
def admin_employee_add(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        position = request.POST.get('position', '')
        is_active = request.POST.get('is_active') == 'true'
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        patronymic = request.POST.get('patronymic', '')
        permissions = request.POST.get('permissions', 'view_only')
        
        errors = []
        
        if not username or not email:
            errors.append('Заполните логин и email')
        elif AdminUser.objects.filter(username=username).exists():
            errors.append('Сотрудник с таким логином уже существует')
        elif not password:
            errors.append('Введите пароль')
        elif password != password2:
            errors.append('Пароли не совпадают')
        
        if errors:
            for error in errors:
                messages.error(request, error)
        else:
            try:
                existing_user = User.objects.get(username=username)
                client = Client.objects.filter(user=existing_user).first()
                if client:
                    client.delete()
                    messages.info(request, f'Профиль клиента для {username} удалён')
                
                if AdminUser.objects.filter(username=username).exists():
                    messages.error(request, f'Пользователь {username} уже является сотрудником')
                    return render(request, 'admin_panel/employees/form.html', {'title': 'Добавить сотрудника'})
                
                employee = AdminUser.objects.create(
                    username=username,
                    email=email,
                    password_hash=make_password(password),
                    position=position,
                    is_active=is_active,
                    first_name=first_name,
                    last_name=last_name,
                    patronymic=patronymic,
                    permissions=permissions,
                )
                existing_user.is_staff = True
                existing_user.is_active = is_active
                existing_user.save()
                
            except User.DoesNotExist:
                employee = AdminUser.objects.create(
                    username=username,
                    email=email,
                    password_hash=make_password(password),
                    position=position,
                    is_active=is_active,
                    first_name=first_name,
                    last_name=last_name,
                    patronymic=patronymic,
                    permissions=permissions,
                )
                User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    is_staff=True,
                    is_active=is_active
                )
            
            if request.FILES.get('avatar'):
                employee.avatar = request.FILES.get('avatar')
                employee.save()
            
            messages.success(request, f'Сотрудник {username} успешно добавлен')
            return redirect('admin_employees')
    
    return render(request, 'admin_panel/employees/form.html', {'title': 'Добавить сотрудника'})

@permission_required(['full'])
def admin_employee_edit(request, employee_id):
    employee = get_object_or_404(AdminUser, id=employee_id)
    
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        position = request.POST.get('position', '')
        is_active = request.POST.get('is_active') == 'true'
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        patronymic = request.POST.get('patronymic', '')
        permissions = request.POST.get('permissions', 'view_only')
        
        if password:
            if password != password2:
                messages.error(request, 'Пароли не совпадают')
                return render(request, 'admin_panel/employees/form.html', {
                    'employee': employee,
                    'title': 'Редактировать сотрудника'
                })
            if len(password) < 6:
                messages.error(request, 'Пароль должен содержать минимум 6 символов')
                return render(request, 'admin_panel/employees/form.html', {
                    'employee': employee,
                    'title': 'Редактировать сотрудника'
                })
        
        employee.username = username
        employee.email = email
        employee.position = position
        employee.is_active = is_active
        employee.first_name = first_name
        employee.last_name = last_name
        employee.patronymic = patronymic
        employee.permissions = permissions
        
        if password:
            employee.password_hash = make_password(password)
            messages.success(request, f'Пароль для {username} обновлён')
        else:
            messages.info(request, f'Пароль для {username} не изменён')
        
        if request.FILES.get('avatar'):
            if employee.avatar:
                try:
                    if os.path.isfile(employee.avatar.path):
                        os.remove(employee.avatar.path)
                except:
                    pass
            employee.avatar = request.FILES.get('avatar')
        
        employee.save()
        
        try:
            user = User.objects.get(username=employee.username)
            user.username = username
            user.email = email
            user.is_active = is_active
            if password:
                user.set_password(password)
            user.save()
            messages.success(request, f'Учётная запись для входа обновлена')
        except User.DoesNotExist:
            User.objects.create_user(
                username=username,
                email=email,
                password=password if password else 'temp123',
                is_staff=True,
                is_active=is_active
            )
            messages.warning(request, f'Создана новая учётная запись для входа')
        
        messages.success(request, f'Сотрудник {username} обновлён')
        return redirect('admin_employees')
    
    return render(request, 'admin_panel/employees/form.html', {
        'employee': employee,
        'title': 'Редактировать сотрудника'
    })

@permission_required(['full'])
def admin_employee_delete(request, employee_id):
    employee = get_object_or_404(AdminUser, id=employee_id)
    if request.method == 'POST':
        username = employee.username
        employee.delete()
        messages.success(request, f'Сотрудник {username} удалён')
        return redirect('admin_employees')
    return render(request, 'admin_panel/employees/employee_confirm_delete.html', {'employee': employee})

@permission_required(['full'])
def admin_employee_reset_password(request, employee_id):
    employee = get_object_or_404(AdminUser, id=employee_id)
    new_password = secrets.token_urlsafe(8)
    employee.password_hash = make_password(new_password)
    employee.save()
    
    display_name = employee.full_name if employee.full_name else employee.username
    messages.success(request, f'Новый пароль для {display_name}: {new_password}')
    return redirect('admin_employees')

@permission_required(['full'])
def admin_employees_api(request):
    employees = AdminUser.objects.filter(is_active=True)
    data = []
    for emp in employees:
        is_online = False
        if emp.last_login:
            delta = timezone.now() - emp.last_login
            is_online = delta.total_seconds() < 300
        data.append({
            'id': emp.id,
            'username': emp.username,
            'full_name': emp.full_name,
            'position': emp.position,
            'permissions': emp.permissions,
            'is_online': is_online,
        })
    return JsonResponse({'employees': data})