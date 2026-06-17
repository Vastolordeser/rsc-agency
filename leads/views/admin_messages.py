from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from ..models import ContactMessage, AdminUser
from ..decorators import permission_required

@permission_required(['full'])
def admin_messages(request):
    messages_list = ContactMessage.objects.all().order_by('-created_at')
    unread_count = messages_list.filter(is_processed=False).count()
    read_count = messages_list.filter(is_processed=True).count()
    
    return render(request, 'admin_panel/messages/list.html', {
        'messages': messages_list,
        'unread_count': unread_count,
        'read_count': read_count,
    })

@permission_required(['full'])
def admin_message_view(request, message_id):
    message = get_object_or_404(ContactMessage, id=message_id)
    return render(request, 'admin_panel/messages/detail.html', {'message': message})

@permission_required(['full'])
def admin_message_delete(request, message_id):
    message = get_object_or_404(ContactMessage, id=message_id)
    if request.method == 'POST':
        message.delete()
        messages.success(request, 'Сообщение удалено')
        return redirect('admin_messages')
    return render(request, 'admin_panel/messages/confirm_delete.html', {'message': message})

@permission_required(['full'])
def admin_message_json(request, message_id):
    message = get_object_or_404(ContactMessage, id=message_id)
    data = {
        'id': message.id,
        'name': message.name,
        'email': message.email,
        'phone': message.phone if hasattr(message, 'phone') else '',
        'message': message.message,
        'created_at': message.created_at.strftime('%d.%m.%Y %H:%M'),
        'is_processed': message.is_processed,
    }
    return JsonResponse(data)

@permission_required(['full'])
def admin_message_reply(request, message_id):
    message = get_object_or_404(ContactMessage, id=message_id)
    
    if request.method == 'POST':
        reply_text = request.POST.get('reply_text', '').strip()
        if reply_text:
            try:
                send_mail(
                    subject=f'Ответ на ваше сообщение | RSC Agency',
                    message=f'Здравствуйте, {message.name}!\n\n{reply_text}\n\nС уважением,\nКоманда RSC Agency',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[message.email],
                    fail_silently=False,
                )
                
                message.reply_text = reply_text
                message.replied_at = timezone.now()
                message.is_processed = True
                
                try:
                    admin_user = request.user.admin_profile
                    message.replied_by = admin_user
                except AdminUser.DoesNotExist:
                    pass
                
                message.save()
                
                messages.success(request, f'Ответ отправлен на {message.email}')
            except Exception as e:
                messages.error(request, f'Ошибка отправки: {e}')
        else:
            messages.error(request, 'Введите текст ответа')
        return redirect('admin_messages')
    
    return render(request, 'admin_panel/messages/reply.html', {'message': message})