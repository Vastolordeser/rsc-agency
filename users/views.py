from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from .forms import RegisterForm, LoginForm
from leads.models import Client, Notification, Lead, AdminUser


def register(request):
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect('admin_dashboard')
        return redirect('index')
    
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Регистрация прошла успешно!')
            if user.is_staff:
                return redirect('admin_dashboard')
            return redirect('index')
        else:
            for error in form.errors.values():
                messages.error(request, error)
    else:
        form = RegisterForm()
    
    return render(request, 'users/register.html', {'form': form})


def user_login(request):
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect('admin_dashboard')
        return redirect('index')
    
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Добро пожаловать, {username}!')
                if user.is_staff:
                    return redirect('admin_dashboard')
                return redirect('index')
        else:
            messages.error(request, 'Неверное имя пользователя или пароль')
    else:
        form = LoginForm()
    
    return render(request, 'users/login.html', {'form': form})


def user_logout(request):
    logout(request)
    messages.success(request, 'Вы вышли из системы')
    return redirect('index')


@login_required
def profile(request):
    is_admin = request.user.is_staff
    admin_user = None
    client = None
    
    # Для ВСЕХ пользователей получаем заявки
    user_leads = Lead.objects.filter(user=request.user).order_by('-created_at')
    
    if is_admin:
        try:
            admin_user = AdminUser.objects.get(username=request.user.username)
        except AdminUser.DoesNotExist:
            admin_user = None
    else:
        try:
            client = Client.objects.get(user=request.user)
        except Client.DoesNotExist:
            client = Client.objects.create(
                user=request.user,
                first_name=request.user.first_name,
                last_name=request.user.last_name,
                email=request.user.email,
                phone=request.user.phone if request.user.phone else ''
            )
    
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    unread_count = notifications.filter(is_read=False).count()

    leads_paginator = Paginator(user_leads, 5)
    leads_page = request.GET.get('leads_page', 1)
    user_leads_page = leads_paginator.get_page(leads_page)

    notif_paginator = Paginator(notifications, 10)
    notif_page = request.GET.get('notif_page', 1)
    notifications_page = notif_paginator.get_page(notif_page)

    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'update_profile':
            if is_admin and admin_user:
                # Обновляем данные администратора
                admin_user.first_name = request.POST.get('first_name', admin_user.first_name or '')
                admin_user.last_name = request.POST.get('last_name', admin_user.last_name or '')
                admin_user.patronymic = request.POST.get('patronymic', admin_user.patronymic or '')
                admin_user.position = request.POST.get('position', admin_user.position or '')
                admin_user.save()
                
                # Обновляем User
                request.user.first_name = admin_user.first_name
                request.user.last_name = admin_user.last_name
                request.user.save()
                
                messages.success(request, 'Профиль обновлён')
                return redirect('profile')
                
            elif not is_admin and client:
                request.user.first_name = request.POST.get('first_name', request.user.first_name)
                request.user.last_name = request.POST.get('last_name', request.user.last_name)
                request.user.phone = request.POST.get('phone', '')
                request.user.email = request.POST.get('email', request.user.email)
                request.user.save()
                
                client.first_name = request.user.first_name
                client.last_name = request.user.last_name
                client.patronymic = request.POST.get('patronymic', '')
                client.phone = request.user.phone
                client.company = request.POST.get('company', '')
                client.position = request.POST.get('position', '')
                client.city = request.POST.get('city', '')
                client.website = request.POST.get('website', '')
                client.address = request.POST.get('address', '')
                client.bio = request.POST.get('bio', '')
                client.email = request.user.email
                
                if request.FILES.get('avatar'):
                    client.avatar = request.FILES.get('avatar')
                
                client.save()
                messages.success(request, 'Профиль обновлён')
                return redirect('profile')
            
        elif action == 'mark_read':
            Notification.objects.filter(id=request.POST.get('notif_id'), user=request.user).update(is_read=True)
            return redirect('profile')
            
        elif action == 'mark_all_read':
            Notification.objects.filter(user=request.user).update(is_read=True)
            return redirect('profile')
    
    context = {
        'user': request.user,
        'user_leads': user_leads_page,
        'notifications': notifications_page,
        'unread_count': unread_count,
        'is_admin': is_admin,
        'admin_user': admin_user,
        'client': client,
    }
    
    return render(request, 'users/profile.html', context)


def client_lead_reply(request, lead_id):
    from leads.models import Lead, LeadHistory, MessageAttachment, Notification, Client
    from django.core.mail import send_mail
    from django.conf import settings
    from django.http import JsonResponse
    from django.shortcuts import get_object_or_404
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    if request.method == 'POST' and request.user.is_authenticated:
        try:
            client = Client.objects.get(user=request.user)
            if client.is_blocked:
                return JsonResponse({'success': False, 'message': 'Ваш аккаунт заблокирован'}, status=403)
        except Client.DoesNotExist:
            pass
        
        lead = get_object_or_404(Lead, id=lead_id, user=request.user)
        reply_message = request.POST.get('reply_message', '').strip()

        history = LeadHistory.objects.create(
            lead=lead,
            action="client_reply",
            comment=reply_message[:500] if reply_message else '(файлы)',
            created_by=request.user
        )
        
        attachments = request.FILES.getlist('attachments')
        for att in attachments:
            MessageAttachment.objects.create(
                message=history,
                file=att,
                filename=att.name,
                file_size=att.size,
                file_type=att.content_type
            )
        
        title = f"Новый ответ от клиента на заявку #{lead.id}"
        message_text = reply_message[:200] if reply_message else f'Прикреплены файлы ({len(attachments)} шт.)'
        
        admins = User.objects.filter(is_staff=True)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title=title,
                message=f"Клиент {lead.name}: {message_text}",
                link=f"/leads/admin/lead/{lead.id}/view/",
                type="client_reply"
            )
        try:
            attachment_list = '\n'.join([f'- {att.name} ({att.size} bytes)' for att in attachments])
            send_mail(
                subject=f"Новый ответ от клиента на заявку #{lead.id}",
                message=f"""
Клиент {lead.name} ответил на заявку #{lead.id}:

{reply_message if reply_message else 'Прикреплены файлы'}

{'Вложения:' + attachment_list if attachments else ''}

Перейти к заявке: http://127.0.0.1:8000/leads/admin/lead/{lead.id}/view/
""",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.DEFAULT_FROM_EMAIL],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Ошибка отправки email: {e}")
        
        return JsonResponse({'success': True, 'message': 'Ответ отправлен'})
    
    return JsonResponse({'success': False, 'message': 'Ошибка'}, status=400)