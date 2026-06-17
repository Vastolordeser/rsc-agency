from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
from ..models import Lead, LeadHistory, MessageAttachment, Notification
from ..decorators import permission_required

@permission_required(['full', 'leads_only'])
def admin_lead_reply(request, lead_id):
    if request.method == 'POST':
        lead = get_object_or_404(Lead, id=lead_id)
        reply_message = request.POST.get('reply_message', '').strip()
        attachments = request.FILES.getlist('attachments')
        
        if not reply_message and not attachments:
            messages.error(request, 'Введите текст ответа или прикрепите файлы')
            return redirect('admin_lead_view', lead_id=lead_id)
        
        if reply_message:
            last_reply = lead.history.filter(
                action='admin_reply',
                created_at__gte=timezone.now() - timedelta(seconds=5)
            ).order_by('-created_at').first()
            if last_reply and last_reply.comment == reply_message:
                messages.warning(request, 'Ответ уже был отправлен')
                return redirect('admin_lead_view', lead_id=lead_id)
        
        from .notifications import send_lead_reply
        success = send_lead_reply(lead, reply_message, request, attachments)
        
        if success:
            messages.success(request, 'Ответ успешно отправлен!')
        else:
            messages.error(request, 'Ошибка при отправке ответа')
        return redirect('admin_lead_view', lead_id=lead_id)
    
    return redirect('admin_lead_view', lead_id=lead_id)

@permission_required(['full', 'leads_only'])
def admin_lead_history(request, lead_id):
    lead = get_object_or_404(Lead, id=lead_id)
    history = lead.history.all()
    status_names = {
        'new': 'Новая', 'processing': 'В обработке',
        'completed': 'Завершена', 'rejected': 'Отклонена'
    }
    data = []
    for h in history:
        attachments = []
        for att in h.attachments.all():
            attachments.append({
                'id': att.id,
                'filename': att.filename,
                'url': att.file.url,
                'size': att.file_size,
            })
        data.append({
            'id': h.id,
            'action': h.action,
            'old_status': status_names.get(h.old_status, h.old_status),
            'new_status': status_names.get(h.new_status, h.new_status),
            'comment': h.comment,
            'created_by': h.created_by.username if h.created_by else 'Система',
            'created_at': h.created_at.strftime('%d.%m.%Y %H:%M'),
            'attachments': attachments,
        })
    return JsonResponse({'history': data})