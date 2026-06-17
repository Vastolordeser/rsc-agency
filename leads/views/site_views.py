from django.shortcuts import render, redirect
from django.contrib import messages
import json
import re
from ..models import Lead, Service, Client, ContactMessage

def lead_create(request):
    """Создание заявки с сайта - цена сохраняется как число"""
    if not request.user.is_authenticated:
        messages.warning(request, 'Для отправки заявки необходимо войти или зарегистрироваться')
        return redirect('login')

    try:
        client = Client.objects.get(user=request.user)
        if client.is_blocked:
            messages.error(request, 'Ваш аккаунт заблокирован.')
            return redirect('index')
    except Client.DoesNotExist:
        pass

    services = Service.objects.filter(is_active=True).order_by('order')
    services_json = []
    for s in services:
        services_json.append({
            'id': s.id,
            'name': s.name,
            'category': s.category,
            'price': s.price,
            'description': s.description,
        })
    services_json_str = json.dumps(services_json, ensure_ascii=False)

    client = Client.objects.filter(user=request.user).first()
    
    if request.method == 'POST':
        login_name = request.POST.get('login_name', '')
        if not login_name and request.user.is_authenticated:
            login_name = request.user.username
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        patronymic = request.POST.get('patronymic', '')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        message = request.POST.get('message', '')
        service_id = request.POST.get('service')

        if login_name and email and phone:
            lead = Lead.objects.create(
                name=login_name,
                email=email,
                phone=phone,
                message=message,
                status='new',
                user=request.user
            )
            
            # Сохраняем услугу и цену как число
            if service_id and service_id != '':
                try:
                    service = Service.objects.get(id=int(service_id))
                    lead.service = service
                    
                    # Извлекаем число из строки цены услуги
                    if service.price:
                        numbers = re.findall(r'[\d\s]+', service.price)
                        if numbers:
                            clean_price = numbers[0].replace(' ', '')
                            try:
                                lead.price = float(clean_price)
                            except:
                                lead.price = None
                        else:
                            lead.price = None
                    else:
                        lead.price = None
                    
                    lead.save()
                except Exception as e:
                    print(f"Ошибка при сохранении услуги: {e}")

            if client:
                if first_name:
                    client.first_name = first_name
                if last_name:
                    client.last_name = last_name
                if patronymic:
                    client.patronymic = patronymic
                client.save()
            
            messages.success(request, 'Заявка успешно отправлена!')
            return redirect('profile')
        else:
            messages.error(request, 'Пожалуйста, заполните все обязательные поля')
    
    context = {
        'services_json': services_json_str,
        'client': client,
        'user': request.user,
    }
    return render(request, 'leads/lead_form.html', context)


def contact_submit(request):
    """Обработка контактной формы"""
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone', '')
        message = request.POST.get('message')
        
        if name and email and phone and message:
            user = request.user if request.user.is_authenticated else None
            
            ContactMessage.objects.create(
                name=name,
                email=email,
                phone=phone,
                message=message,
                user=user  
            )
            messages.success(request, 'Сообщение отправлено!')
        else:
            messages.error(request, 'Заполните все поля')
    return redirect('contacts')