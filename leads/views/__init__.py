# Инициализация модуля views
from .site_views import lead_create, contact_submit
from .admin_dashboard import admin_dashboard
from .admin_clients import (
    admin_clients, admin_client_view, admin_client_edit,
    admin_client_delete, admin_client_add, admin_client_block, admin_client_unblock
)
from .admin_leads import (
    admin_leads, admin_lead_view, admin_lead_edit, admin_lead_delete,
    admin_lead_add, admin_lead_change_status, admin_lead_bulk_delete,
    admin_lead_bulk_status, admin_lead_export
)
from .admin_services import (
    admin_services, admin_service_create, admin_service_edit,
    admin_service_delete, admin_service_toggle
)
from .admin_projects import (
    admin_projects, admin_project_add, admin_project_edit,
    admin_project_delete, admin_project_toggle
)
from .admin_employees import (
    admin_employees, admin_employee_add, admin_employee_edit,
    admin_employee_delete, admin_employee_reset_password, admin_employees_api
)
from .admin_messages import (
    admin_messages, admin_message_view, admin_message_delete,
    admin_message_json, admin_message_reply
)
from .admin_replies import admin_lead_reply, admin_lead_history
from .notifications import send_lead_notification, send_lead_reply
from .api_views import (
    api_services, api_projects, api_project_detail,
    api_notifications, mark_notification_read, mark_all_notifications_read,
    admin_leads_json, admin_leads_history_api, lead_messages_api,
    user_messages_api, lead_detail_api, client_replies_api,
    admin_leads_stats, admin_stats_total, lead_redirect
)
from .utils import check_permission, get_user_role