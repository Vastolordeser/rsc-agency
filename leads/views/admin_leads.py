from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from django.core.paginator import Paginator
import json
import csv
import re
from django.http import HttpResponse
from ..models import Lead, Service, Client, LeadHistory
from ..decorators import permission_required

@permission_required(['full', 'leads_only'])
def admin_leads(request):
    leads = Lead.objects.all().order_by('-created_at')
    stats = {
        'all': Lead.objects.count(),
        'new': Lead.objects.filter(status='new').count(),
        'processing': Lead.objects.filter(status='processing').count(),
        'completed': Lead.objects.filter(status='completed').count(),
        'rejected': Lead.objects.filter(status='rejected').count(),
    }
    paginator = Paginator(leads, 15)
    page = request.GET.get('page', 1)
    leads_page = paginator.get_page(page)
    return render(request, 'admin_panel/leads/list.html', {
        'leads': leads_page,
        'stats': stats,
    })

@permission_required(['full', 'leads_only'])
def admin_lead_view(request, lead_id):
    try:
        lead = Lead.objects.get(id=lead_id)
        client = None
        if lead.user:
            try:
                client = Client.objects.get(user=lead.user)
            except Client.DoesNotExist:
                pass
        return render(request, 'admin_panel/leads/detail.html', {
            'lead': lead,
            'client': client
        })
    except Lead.DoesNotExist:
        messages.error(request, f'Заявка #{lead_id} была удалена')
        return redirect('admin_leads')

@permission_required(['full', 'leads_only'])
def admin_lead_edit(request, lead_id):
    """Редактирование заявки - цена как число"""
    lead = get_object_or_404(Lead, id=lead_id)
    if request.method == 'POST':
        lead.name = request.POST.get('name')
        lead.email = request.POST.get('email')
        lead.phone = request.POST.get('phone')
        lead.status = request.POST.get('status')
        lead.message = request.POST.get('message', '')
        
        price_raw = request.POST.get('price', '')
        if price_raw:
            try:
                lead.price = float(price_raw)
            except:
                lead.price = None
        else:
            lead.price = None
        
        service_id = request.POST.get('service')
        if service_id:
            lead.service_id = int(service_id)
        else:
            lead.service = None
            
        lead.save()
        
        if lead.status == 'completed' and lead.user:
            try:
                client = Client.objects.get(user=lead.user)
                client.update_total_spent()
            except Client.DoesNotExist:
                pass
        
        messages.success(request, 'Заявка обновлена')
        return redirect('admin_leads')
    
    services = Service.objects.filter(is_active=True)
    return render(request, 'admin_panel/leads/edit.html', {
        'lead': lead, 
        'services': services
    })

@permission_required(['full', 'leads_only'])
def admin_lead_delete(request, lead_id):
    lead = get_object_or_404(Lead, id=lead_id)
    if request.method == 'POST':
        lead.delete()
        messages.success(request, 'Заявка удалена')
        return redirect('admin_leads')
    return render(request, 'admin_panel/leads/confirm_delete.html', {'lead': lead})

@permission_required(['full', 'leads_only'])
def admin_lead_add(request):
    """Добавление заявки из админки - цена как число"""
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        status = request.POST.get('status', 'new')
        message = request.POST.get('message', '')
        service_id = request.POST.get('service')
        
        if name and email and phone:
            lead = Lead.objects.create(
                name=name,
                email=email,
                phone=phone,
                status=status,
                message=message,
                user=request.user
            )
            
            if service_id:
                try:
                    service = Service.objects.get(id=int(service_id))
                    lead.service = service
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
                    print(f"Ошибка: {e}")
            
            messages.success(request, 'Заявка создана')
            return redirect('admin_leads')
        messages.error(request, 'Заполните все поля')
    services = Service.objects.filter(is_active=True)
    return render(request, 'admin_panel/leads/add.html', {'services': services})

@permission_required(['full', 'leads_only'])
def admin_lead_change_status(request, lead_id):
    lead = get_object_or_404(Lead, id=lead_id)
    
    if request.method == 'POST':
        new_status = request.POST.get('status')
        old_status = lead.status
        
        status_names = {
            'new': 'Новая',
            'processing': 'В обработке',
            'completed': 'Завершена',
            'rejected': 'Отклонена'
        }
        
        if new_status in dict(Lead.STATUS_CHOICES) and new_status != old_status:
            lead.status = new_status
            lead.save()
            
            LeadHistory.objects.create(
                lead=lead,
                action='change_status',
                old_status=old_status,
                new_status=new_status,
                comment=f'Статус изменён с "{status_names.get(old_status, old_status)}" на "{status_names.get(new_status, new_status)}"',
                created_by=request.user
            )
            
            if new_status == 'completed' and lead.user:
                try:
                    client = Client.objects.get(user=lead.user)
                    client.update_total_spent()
                except Client.DoesNotExist:
                    pass
            
            from .notifications import send_lead_notification
            send_lead_notification(lead, old_status, new_status, request)
            
            messages.success(request, f'Статус заявки #{lead.id} изменён на "{lead.get_status_display()}"')
        else:
            messages.error(request, 'Неверный статус или статус не изменился')
    
    return redirect('admin_lead_view', lead_id=lead_id)

@permission_required(['full', 'leads_only'])
def admin_lead_bulk_delete(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        ids = data.get('ids', [])
        deleted = Lead.objects.filter(id__in=ids).delete()[0]
        return JsonResponse({'success': True, 'deleted': deleted})
    return JsonResponse({'success': False}, status=400)

@permission_required(['full', 'leads_only'])
def admin_lead_bulk_status(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        ids = data.get('ids', [])
        status = data.get('status')
        if status:
            updated = Lead.objects.filter(id__in=ids).update(status=status)
            return JsonResponse({'success': True, 'updated': updated})
    return JsonResponse({'success': False}, status=400)

@permission_required(['full', 'leads_only'])
def admin_lead_export(request):
    leads = Lead.objects.all().order_by('-created_at')
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="zayavki.csv"'
    response.write('\ufeff')
    
    writer = csv.writer(response, delimiter=';')
    writer.writerow(['ID', 'Имя', 'Email', 'Телефон', 'Статус', 'Сообщение', 'Цена', 'Дата'])
    for lead in leads:
        writer.writerow([
            lead.id,
            lead.name,
            lead.email,
            lead.phone,
            lead.get_status_display(),
            lead.message.replace('\n', ' ') if lead.message else '',
            str(lead.price) if lead.price else '',
            lead.created_at.strftime('%d.%m.%Y %H:%M')
        ])
    
    return response