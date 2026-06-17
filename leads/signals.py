from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Lead, Client

@receiver(post_save, sender=Lead)
def update_client_spent_on_complete(sender, instance, **kwargs):
    if instance.status == 'completed' and instance.user:
        try:
            client = Client.objects.get(user=instance.user)
            client.update_total_spent()
        except Client.DoesNotExist:
            pass