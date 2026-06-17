from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.core.paginator import Paginator
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from ..models import Client
from ..decorators import permission_required

User = get_user_model()

@permission_required(['full', 'clients_only'])
def admin_clients(request):
    clients = Client.objects.all().order_by('-created_at')
    stats = {'all': clients.count()}
    paginator = Paginator(clients, 15)
    page = request.GET.get('page', 1)
    clients_page = paginator.get_page(page)
    return render(request, 'admin_panel/clients/list.html', {
        'clients': clients_page,
        'stats': stats,
    })

@permission_required(['full', 'clients_only'])
def admin_client_view(request, client_id):
    client = get_object_or_404(Client, id=client_id)
    return render(request, 'admin_panel/clients/detail.html', {'client': client})

@permission_required(['full', 'clients_only'])
def admin_client_edit(request, client_id):
    client = get_object_or_404(Client, id=client_id)
    if request.method == 'POST':
        client.first_name = request.POST.get('first_name', client.first_name)
        client.last_name = request.POST.get('last_name', client.last_name)
        client.patronymic = request.POST.get('patronymic', client.patronymic)
        client.phone = request.POST.get('phone', client.phone)
        client.company = request.POST.get('company', client.company)
        client.address = request.POST.get('address', client.address)
        client.city = request.POST.get('city', client.city)
        client.website = request.POST.get('website', client.website)
        client.position = request.POST.get('position', client.position)
        client.bio = request.POST.get('bio', client.bio)
        client.save()
        messages.success(request, 'Клиент обновлён')
        return redirect('admin_clients')
    
    return render(request, 'admin_panel/clients/edit.html', {'client': client})

@permission_required(['full', 'clients_only'])
def admin_client_delete(request, client_id):
    """Удаление клиента"""
    client = get_object_or_404(Client, id=client_id)
    if request.method == 'POST':
        from django.db import connection
        with connection.cursor() as cursor:
            user_id = client.user_id
            cursor.execute('PRAGMA foreign_keys = OFF')
            cursor.execute('DELETE FROM notifications WHERE user_id = %s', [user_id])
            cursor.execute('DELETE FROM requests WHERE user_id = %s', [user_id])
            cursor.execute('DELETE FROM leads_contactmessage WHERE user_id = %s', [user_id])
            cursor.execute('DELETE FROM clients WHERE id = %s', [client.id])
            cursor.execute('DELETE FROM users WHERE id = %s', [user_id])
            cursor.execute('PRAGMA foreign_keys = ON')
        messages.success(request, 'Клиент успешно удалён')
        return redirect('admin_clients')
    return render(request, 'admin_panel/clients/confirm_delete.html', {'client': client})

@permission_required(['full', 'clients_only'])
def admin_client_add(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name', '')
        patronymic = request.POST.get('patronymic', '')
        phone = request.POST.get('phone')
        company = request.POST.get('company', '')
        position = request.POST.get('position', '')
        city = request.POST.get('city', '')
        website = request.POST.get('website', '')
        address = request.POST.get('address', '')
        bio = request.POST.get('bio', '')
        
        errors = []
        
        if not username or not email or not password or not first_name or not phone:
            errors.append('Заполните все обязательные поля')
        if password != password2:
            errors.append('Пароли не совпадают')
        if User.objects.filter(username=username).exists():
            errors.append('Пользователь с таким логином уже существует')
        if User.objects.filter(email=email).exists():
            errors.append('Пользователь с таким email уже существует')
        
        if errors:
            for error in errors:
                messages.error(request, error)
        else:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_active=True
            )
            client = Client.objects.create(
                user=user,
                first_name=first_name,
                last_name=last_name,
                patronymic=patronymic,
                email=email,
                phone=phone,
                company=company,
                position=position,
                city=city,
                website=website,
                address=address,
                bio=bio
            )
            if request.FILES.get('avatar'):
                client.avatar = request.FILES.get('avatar')
                client.save()
            messages.success(request, f'Клиент {first_name} успешно добавлен')
            return redirect('admin_clients')
    
    return render(request, 'admin_panel/clients/add.html')

@permission_required(['full', 'clients_only'])
def admin_client_block(request, client_id):
    client = get_object_or_404(Client, id=client_id)
    client.is_blocked = True
    client.save()
    messages.success(request, f'Клиент "{client.name}" заблокирован')
    return redirect('admin_clients')

@permission_required(['full', 'clients_only'])
def admin_client_unblock(request, client_id):
    client = get_object_or_404(Client, id=client_id)
    client.is_blocked = False
    client.save()
    messages.success(request, f'Клиент "{client.name}" разблокирован')
    return redirect('admin_clients')