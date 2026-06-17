from django.urls import path
from . import views

urlpatterns = [
    # ДАШБОРД
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),

    # КЛИЕНТЫ (отдельная модель)
    path('admin/clients/', views.admin_clients, name='admin_clients'),
    path('admin/client/<int:client_id>/view/', views.admin_client_view, name='admin_client_view'),
    path('admin/client/<int:client_id>/edit/', views.admin_client_edit, name='admin_client_edit'),
    path('admin/client/<int:client_id>/delete/', views.admin_client_delete, name='admin_client_delete'),
    path('admin/client/<int:client_id>/block/', views.admin_client_block, name='admin_client_block'),
    path('admin/client/<int:client_id>/unblock/', views.admin_client_unblock, name='admin_client_unblock'),
    path('admin/client/add/', views.admin_client_add, name='admin_client_add'),

    # ПРОЕКТЫ
    path('admin/projects/', views.admin_projects, name='admin_projects'),
    path('admin/project/<int:project_id>/edit/', views.admin_project_edit, name='admin_project_edit'),
    path('admin/project/<int:project_id>/delete/', views.admin_project_delete, name='admin_project_delete'),
    path('admin/project/<int:project_id>/toggle/', views.admin_project_toggle, name='admin_project_toggle'),
    path('admin/project/add/', views.admin_project_add, name='admin_project_add'),

    # СОТРУДНИКИ
    path('admin/employees/', views.admin_employees, name='admin_employees'),
    path('admin/employee/add/', views.admin_employee_add, name='admin_employee_add'),

    # СООБЩЕНИЯ
    path('admin/messages/', views.admin_messages, name='admin_messages'),
    path('admin/message/<int:message_id>/view/', views.admin_message_view, name='admin_message_view'),
    path('admin/message/<int:message_id>/delete/', views.admin_message_delete, name='admin_message_delete'),
    
    path('admin/message/<int:message_id>/json/', views.admin_message_json, name='admin_message_json'),
path('admin/message/<int:message_id>/reply/', views.admin_message_reply, name='admin_message_reply'),

    # НАСТРОЙКИ
            # ЗАЯВКИ - полный CRUD
    path('admin/leads/', views.admin_leads, name='admin_leads'),
    path('admin/lead/<int:lead_id>/view/', views.admin_lead_view, name='admin_lead_view'),
    path('admin/lead/<int:lead_id>/edit/', views.admin_lead_edit, name='admin_lead_edit'),
    path('admin/lead/<int:lead_id>/delete/', views.admin_lead_delete, name='admin_lead_delete'),
    path('admin/lead/add/', views.admin_lead_add, name='admin_lead_add'),
    path('admin/lead/<int:lead_id>/change-status/', views.admin_lead_change_status, name='admin_lead_change_status'),
    path('admin/leads/bulk-delete/', views.admin_lead_bulk_delete, name='admin_lead_bulk_delete'),
    path('admin/leads/bulk-status/', views.admin_lead_bulk_status, name='admin_lead_bulk_status'),
    path('admin/leads/export/', views.admin_lead_export, name='admin_lead_export'),
    path('admin/stats/total/', views.admin_stats_total, name='admin_stats_total'),
    
    # API
    path('api/services/', views.api_services, name='api_services'),
    path('api/projects/', views.api_projects, name='api_projects'),
    path('api/projects/<int:project_id>/', views.api_project_detail, name='api_project_detail'),
    path('api/notifications/', views.api_notifications, name='api_notifications'),
    path('api/notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('api/notifications/read-all/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    
    # Сайт
    path('create/', views.lead_create, name='lead_create'),
    path('contact-submit/', views.contact_submit, name='contact_submit'),

    # УСЛУГИ
    path('admin/services/', views.admin_services, name='admin_services'),
    path('admin/services/create/', views.admin_service_create, name='admin_service_create'),
    path('admin/services/<int:service_id>/edit/', views.admin_service_edit, name='admin_service_edit'),
    path('admin/services/<int:service_id>/delete/', views.admin_service_delete, name='admin_service_delete'),
    path('admin/services/<int:service_id>/toggle/', views.admin_service_toggle, name='admin_service_toggle'),
    path('admin/lead/<int:lead_id>/reply/', views.admin_lead_reply, name='admin_lead_reply'),
    path('admin/lead/<int:lead_id>/history/', views.admin_lead_history, name='admin_lead_history'),
    path('admin/leads/stats/', views.admin_leads_stats, name='admin_leads_stats'),
    path('admin/leads/json/', views.admin_leads_json, name='admin_leads_json'),

    path('api/lead/<int:lead_id>/messages/', views.lead_messages_api, name='lead_messages_api'),

    path('api/user/messages/', views.user_messages_api, name='user_messages_api'),

    path('api/lead/<int:lead_id>/detail/', views.lead_detail_api, name='lead_detail_api'),

    path('admin/employee/<int:employee_id>/edit/', views.admin_employee_edit, name='admin_employee_edit'),
    path('admin/employee/<int:employee_id>/delete/', views.admin_employee_delete, name='admin_employee_delete'),
    path('admin/employee/<int:employee_id>/reset-password/', views.admin_employee_reset_password, name='admin_employee_reset_password'),
    path('admin/employees/api/', views.admin_employees_api, name='admin_employees_api'),
    path('admin/leads/history/api/', views.admin_leads_history_api, name='admin_leads_history_api'),
    path('lead/<int:lead_id>/', views.lead_redirect, name='lead_redirect'),
]











