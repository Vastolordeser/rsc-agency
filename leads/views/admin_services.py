from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.db import connection
import os
from ..models import Service
from ..decorators import permission_required

@permission_required(['full'])
def admin_services(request):
    services = Service.objects.all().order_by('order')
    paginator = Paginator(services, 15)
    page = request.GET.get('page', 1)
    services_page = paginator.get_page(page)
    return render(request, 'admin_panel/services/list.html', {'services': services_page})

@permission_required(['full'])
def admin_service_create(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        category = request.POST.get('category')
        price = request.POST.get('price', '')
        description = request.POST.get('description', '')
        features = request.POST.get('features', '')
        order = request.POST.get('order', 0)
        is_active = request.POST.get('is_active') == 'on'

        if name and category:
            from ..models import AdminUser
            created_by = None
            try:
                created_by = request.user.admin_profile
            except:
                pass
            
            service = Service.objects.create(
                name=name,
                category=category,
                price=price,
                description=description,
                features=features,
                order=order,
                is_active=is_active,
                created_by=created_by  
            )
            if request.FILES.get('image'):
                service.image = request.FILES.get('image')
                service.save()
            messages.success(request, 'Услуга успешно создана!')
            return redirect('admin_services')
        else:
            messages.error(request, 'Заполните обязательные поля')
    return render(request, 'admin_panel/services/form.html', {'title': 'Создание услуги'})

@permission_required(['full'])
def admin_service_edit(request, service_id):
    service = get_object_or_404(Service, id=service_id)
    if request.method == 'POST':
        service.name = request.POST.get('name')
        service.category = request.POST.get('category')
        service.price = request.POST.get('price', '')
        service.description = request.POST.get('description', '')
        service.features = request.POST.get('features', '')
        service.order = request.POST.get('order', 0)
        service.is_active = request.POST.get('is_active') == 'on'
        if request.FILES.get('image'):
            if service.image:
                try:
                    if os.path.isfile(service.image.path):
                        os.remove(service.image.path)
                except:
                    pass
            service.image = request.FILES.get('image')
        service.save()
        messages.success(request, 'Услуга успешно обновлена!')
        return redirect('admin_services')
    return render(request, 'admin_panel/services/form.html', {
        'service': service,
        'title': 'Редактирование услуги'
    })

@permission_required(['full'])
def admin_service_delete(request, service_id):
    service = get_object_or_404(Service, id=service_id)
    if request.method == 'POST':
        with connection.cursor() as cursor:
            cursor.execute('DELETE FROM services WHERE id = %s', [service.id])
        messages.success(request, 'Услуга удалена')
        return redirect('admin_services')
    return render(request, 'admin_panel/services/confirm_delete.html', {'service': service})

@permission_required(['full'])
def admin_service_toggle(request, service_id):
    service = get_object_or_404(Service, id=service_id)
    service.is_active = not service.is_active
    service.save()
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True, 'is_active': service.is_active})
    return redirect('admin_services')