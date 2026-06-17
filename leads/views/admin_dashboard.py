from django.shortcuts import render
from django.utils import timezone
from datetime import timedelta
from ..models import Lead, Service, Project, Client, ContactMessage, Notification, AdminUser
from ..decorators import permission_required

@permission_required(['full', 'view_only', 'leads_only', 'clients_only'])
def admin_dashboard(request):
    if request.user.is_authenticated:
        try:
            admin_user = request.user.admin_profile
            admin_user.last_login = timezone.now()
            admin_user.save()
        except:
            pass
    
    today = timezone.now().date()
    leads_by_day = []
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        count = Lead.objects.filter(created_at__date=date).count()
        leads_by_day.append(count)
    
    status_stats = {
        'new': Lead.objects.filter(status='new').count(),
        'processing': Lead.objects.filter(status='processing').count(),
        'completed': Lead.objects.filter(status='completed').count(),
        'rejected': Lead.objects.filter(status='rejected').count(),
    }
    
    recent_leads = Lead.objects.all().order_by('-created_at')[:10]
    services_list = Service.objects.filter(is_active=True).order_by('-created_at')[:10]
    employees_list = AdminUser.objects.filter(is_active=True)[:10]
    notifications = Notification.objects.filter(user=request.user, is_read=False).order_by('-created_at')[:10]
    unread_count = notifications.count()
    
    context = {
        'total_leads': Lead.objects.count(),
        'new_leads': status_stats['new'],
        'processing_leads': status_stats['processing'],
        'completed_leads': status_stats['completed'],
        'rejected_leads': status_stats['rejected'],
        'total_services': Service.objects.count(),
        'total_projects': Project.objects.count(),
        'total_messages': ContactMessage.objects.count(),
        'total_clients': Client.objects.count(),
        'total_employees': AdminUser.objects.count(),
        'recent_leads': recent_leads,
        'services_list': services_list,
        'employees_list': employees_list,
        'leads_by_day': leads_by_day,
        'status_stats': status_stats,
        'unread_count': unread_count,
        'notifications': notifications,
        'now': timezone.now(),
    }
    return render(request, 'admin_panel/dashboard.html', context)