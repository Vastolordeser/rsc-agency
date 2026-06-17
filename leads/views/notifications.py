from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from ..models import Lead, Notification, LeadHistory, MessageAttachment

User = get_user_model()

def send_lead_notification(lead, old_status, new_status, request=None):
    status_names = {
        'new': 'Новая',
        'processing': 'В обработке',
        'completed': 'Завершена',
        'rejected': 'Отклонена'
    }
    old_name = status_names.get(old_status, old_status)
    new_name = status_names.get(new_status, new_status)
    title = f"Заявка #{lead.id}"
    message = f"Статус изменён на {new_name}"
    
    if lead.user:
        Notification.objects.create(
            user=lead.user,
            title=title,
            message=message,
            link=f"/leads/admin/lead/{lead.id}/view/",
            type="status_change"
        )
    
    admins = User.objects.filter(is_staff=True)
    for admin in admins:
        if not lead.user or admin != lead.user:
            Notification.objects.create(
                user=admin,
                title=title,
                message=message,
                link=f"/leads/admin/lead/{lead.id}/view/",
                type="status_change"
            )
    
    try:
        send_mail(
            subject=f"RSC Agency - {title}",
            message=f"Здравствуйте, {lead.name}!\n\nСтатус вашей заявки #{lead.id} изменён с \"{old_name}\" на \"{new_name}\".\n\nС уважением,\nКоманда RSC Agency",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[lead.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Ошибка отправки email: {e}")
    


def send_lead_reply(lead, reply_message, request, attachments=None):
    title = f"Ответ на заявку #{lead.id}"
    user = request.user if request.user.is_authenticated else None
    
    if reply_message:
        try:
            send_mail(
                subject=f"RSC Agency - {title}",
                message=f"Здравствуйте, {lead.name}!\n\nОтвет на вашу заявку #{lead.id}:\n\n{reply_message}\n\nС уважением,\nКоманда RSC Agency",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[lead.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Ошибка отправки email: {e}")
            return False
    
    comment_text = reply_message[:500] if reply_message else f'(прикреплено файлов: {len(attachments or [])})'
    history = LeadHistory.objects.create(
        lead=lead,
        action="admin_reply",
        comment=comment_text,
        created_by=user
    )
    
    if attachments:
        for att in attachments:
            MessageAttachment.objects.create(
                message=history,
                file=att,
                filename=att.name,
                file_size=att.size,
                file_type=att.content_type
            )
    
    if lead.user:
        notif_message = reply_message[:200] if reply_message else f'Прикреплены файлы ({len(attachments)} шт.)'
        Notification.objects.create(
            user=lead.user,
            title=title,
            message=notif_message,
            link=f"/leads/admin/lead/{lead.id}/view/",
            type="reply"
        )
    
    admins = User.objects.filter(is_staff=True)
    for admin in admins:
        if not lead.user or admin != lead.user:
            Notification.objects.create(
                user=admin,
                title=title,
                message=notif_message,
                link=f"/leads/admin/lead/{lead.id}/view/",
                type="reply"
            )
    
    return True
