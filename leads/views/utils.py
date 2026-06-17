from ..models import AdminUser

def check_permission(user, allowed_permissions):
    if user.is_superuser:
        return True
    
    try:
        employee = user.admin_profile
        if employee.permissions == 'full':
            return True
        return employee.permissions in allowed_permissions
    except (AdminUser.DoesNotExist, AttributeError):
        if user.is_staff:
            return True
        return False

def get_user_role(user):
    if user.is_superuser:
        return 'superuser'
    
    try:
        employee = user.admin_profile
        return employee.permissions
    except (AdminUser.DoesNotExist, AttributeError):
        if user.is_staff:
            return 'staff'
        return 'client'