from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from leads.models import Client, AdminUser

class UpdateLastActivityMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if request.user.is_authenticated:
            # Обновляем для клиентов
            try:
                client = Client.objects.get(user=request.user)
                if client.last_activity:
                    delta = timezone.now() - client.last_activity
                    if delta.total_seconds() > 30:
                        client.last_activity = timezone.now()
                        client.save(update_fields=['last_activity'])
                else:
                    client.last_activity = timezone.now()
                    client.save(update_fields=['last_activity'])
            except Client.DoesNotExist:
                pass
            
            # Обновляем для сотрудников
            try:
                admin = request.user.admin_profile
                if admin.last_login:
                    delta = timezone.now() - admin.last_login
                    if delta.total_seconds() > 30:
                        admin.last_login = timezone.now()
                        admin.save(update_fields=['last_login'])
                else:
                    admin.last_login = timezone.now()
                    admin.save(update_fields=['last_login'])
            except AdminUser.DoesNotExist:
                pass
                
        return response