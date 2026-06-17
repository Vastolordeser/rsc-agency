from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from ..models import Service, Project, Notification, Lead, LeadHistory, Client
from ..decorators import permission_required

User = get_user_model()
def api_services(request):
    services = Service.objects.filter(is_active=True)
    data = []
    for s in services:
        item = {
            'id': s.id,
            'name': s.name,
            'category': s.category,
            'price': s.price,
            'description': s.description,
            'features': s.features,
            'order': s.order,
            'is_active': s.is_active,
        }
        if s.image:
            item['image'] = s.image.url
            item['image_url'] = s.image.url
        data.append(item)
    return JsonResponse({'services': data})

def api_projects(request):
    projects = Project.objects.filter(is_active=True)
    data = []
    for p in projects:
        item = {
            'id': p.id,
            'name': p.name,
            'client': p.client,
            'description': p.description,
            'category_display': 'Проект',
        }
        if p.image and p.image.url:
            item['image'] = p.image.url
        data.append(item)
    return JsonResponse({'projects': data})

def api_project_detail(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
        data = {
            'id': project.id,
            'name': project.name,
            'client': project.client,
            'description': project.description
        }
        return JsonResponse(data)
    except Project.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

def api_notifications(request):
    if not request.user.is_authenticated:
        return JsonResponse({'notifications': []})
    
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:10]
    data = []
    for n in notifications:
        data.append({
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'link': n.link,
            'created_at': n.created_at.strftime('%d.%m.%Y %H:%M'),
            'is_read': n.is_read,
        })
    return JsonResponse({'notifications': data})

def mark_notification_read(request, notification_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return JsonResponse({'success': True})
    except Notification.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

def mark_all_notifications_read(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'success': True, 'count': count})

def lead_messages_api(request, lead_id):
    lead = get_object_or_404(Lead, id=lead_id)
    messages_list = lead.history.all().order_by('created_at')
    messages = []
    for msg in messages_list:
        is_client = msg.action == 'client_reply'
        is_admin = msg.action == 'admin_reply' or msg.action == 'change_status'
        attachments = []
        for att in msg.attachments.all():
            attachments.append({
                'id': att.id,
                'filename': att.filename,
                'url': att.file.url,
                'size': att.file_size,
            })
        if is_client:
            msg_type = 'client'
            user_name = msg.created_by.username if msg.created_by else 'Клиент'
        elif is_admin:
            msg_type = 'admin'
            user_name = msg.created_by.username if msg.created_by else 'Админ'
        else:
            msg_type = 'system'
            user_name = 'Система'
        messages.append({
            'id': msg.id,
            'message': msg.comment,
            'type': msg_type,
            'user': user_name,
            'created_at': msg.created_at.strftime('%d.%m.%Y %H:%M'),
            'attachments': attachments,
        })
    return JsonResponse({'messages': messages})

def user_messages_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'messages': []})
    
    leads = Lead.objects.filter(user=request.user).order_by('-created_at')
    result = []
    for lead in leads:
        last_msg = lead.history.order_by('-created_at').first()
        result.append({
            'lead_id': lead.id,
            'last_message': last_msg.comment[:100] if last_msg and last_msg.comment else (lead.message[:100] if lead.message else 'Нет сообщений'),
            'last_message_date': last_msg.created_at.strftime('%d.%m.%Y %H:%M') if last_msg else lead.created_at.strftime('%d.%m.%Y %H:%M'),
            'status': lead.status,
        })
    return JsonResponse({'messages': result})

def lead_detail_api(request, lead_id):
    lead = get_object_or_404(Lead, id=lead_id)
    data = {
        'id': lead.id,
        'name': lead.name,
        'email': lead.email,
        'phone': lead.phone,
        'status': lead.status,
        'status_display': lead.get_status_display(),
        'created_at': lead.created_at.strftime('%d.%m.%Y %H:%M'),
        'updated_at': lead.updated_at.strftime('%d.%m.%Y %H:%M') if lead.updated_at else '',
        'message': lead.message,
        'service': lead.service.name if lead.service else None,
    }
    return JsonResponse(data)

def client_replies_api(request, lead_id):
    lead = get_object_or_404(Lead, id=lead_id)
    replies = lead.history.filter(action='client_reply').values('comment', 'created_at', 'created_by__username')
    data = []
    for r in replies:
        data.append({
            'message': r['comment'],
            'created_at': r['created_at'].strftime('%d.%m.%Y %H:%M'),
            'user': r['created_by__username'] or 'Клиент'
        })
    return JsonResponse({'replies': data})

def lead_redirect(request, lead_id):
    from django.shortcuts import redirect
    return redirect('admin_lead_view', lead_id=lead_id)

# ===== АДМИНИСТРАТИВНЫЕ API (с проверкой прав) =====

@permission_required(['full', 'leads_only'])
def admin_leads_json(request):
    limit = request.GET.get('limit', 10)
    leads = Lead.objects.all().order_by('-created_at')[:int(limit)]
    data = []
    for lead in leads:
        data.append({
            'id': lead.id,
            'name': lead.name,
            'email': lead.email,
            'phone': lead.phone,
            'status': lead.status,
            'status_display': lead.get_status_display(),
            'message': lead.message,
            'created_at': lead.created_at.strftime('%d.%m.%Y %H:%M'),
        })
    return JsonResponse({'leads': data})

@permission_required(['full', 'leads_only'])
def admin_leads_history_api(request):
    limit = request.GET.get('limit', 10)
    try:
        limit = int(limit)
    except:
        limit = 10
    
    actions = LeadHistory.objects.all().order_by('-created_at')[:limit]
    data = []
    for action in actions:
        data.append({
            'id': action.id,
            'action': action.action,
            'action_display': action.get_action_display() if hasattr(action, 'get_action_display') else action.action,
            'comment': action.comment,
            'created_at': action.created_at.strftime('%d.%m.%Y %H:%M'),
            'user': action.created_by.username if action.created_by else 'Система',
        })
    return JsonResponse({'actions': data})

@permission_required(['full', 'leads_only'])
def admin_leads_stats(request):
    stats = {
        'all': Lead.objects.count(),
        'new': Lead.objects.filter(status='new').count(),
        'processing': Lead.objects.filter(status='processing').count(),
        'completed': Lead.objects.filter(status='completed').count(),
        'rejected': Lead.objects.filter(status='rejected').count(),
    }
    return JsonResponse(stats)

@permission_required(['full'])
def admin_stats_total(request):
    from ..models import Client, Service, Project, ContactMessage, AdminUser
    data = {
        'clients': Client.objects.count(),
        'services': Service.objects.count(),
        'projects': Project.objects.count(),
        'messages': ContactMessage.objects.count(),
        'employees': AdminUser.objects.count(),
    }
    return JsonResponse(data)