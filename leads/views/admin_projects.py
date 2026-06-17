from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.db import connection
import os
from ..models import Project
from ..decorators import permission_required

@permission_required(['full'])
def admin_projects(request):
    projects = Project.objects.all().order_by('-id')
    paginator = Paginator(projects, 15)
    page = request.GET.get('page', 1)
    projects_page = paginator.get_page(page)
    return render(request, 'admin_panel/projects/list.html', {'projects': projects_page})

@permission_required(['full'])
def admin_project_add(request):
    """Добавление проекта - с сохранением создателя"""
    if request.method == 'POST':
        name = request.POST.get('name')
        category = request.POST.get('category', 'other')
        client = request.POST.get('client', '')
        description = request.POST.get('description', '')
        link = request.POST.get('link', '')
        result = request.POST.get('result', '')
        sort_order = request.POST.get('sort_order', 0)
        status = request.POST.get('status', 'active')
        is_active = request.POST.get('is_active') == 'on'
        
        if not name:
            messages.error(request, 'Заполните название проекта')
            return render(request, 'admin_panel/projects/form.html', {'title': 'Добавление проекта'})
        
        from ..models import AdminUser
        created_by = None
        try:
            created_by = request.user.admin_profile
        except:
            pass
        
        project = Project.objects.create(
            name=name,
            category=category,
            client=client,
            description=description,
            link=link,
            result=result,
            sort_order=int(sort_order) if sort_order else 0,
            status=status,
            is_active=is_active,
            created_by=created_by
        )
        
        if request.FILES.get('image'):
            project.image = request.FILES.get('image')
            project.save()
        
        messages.success(request, f'Проект "{name}" успешно добавлен')
        return redirect('admin_projects')
    
    return render(request, 'admin_panel/projects/form.html', {'title': 'Добавление проекта'})

@permission_required(['full'])
def admin_project_edit(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    
    if request.method == 'POST':
        name = request.POST.get('name')
        category = request.POST.get('category', 'other')
        client = request.POST.get('client', '')
        description = request.POST.get('description', '')
        link = request.POST.get('link', '')
        result = request.POST.get('result', '')
        sort_order = request.POST.get('sort_order', 0)
        status = request.POST.get('status', 'active')
        is_active = request.POST.get('is_active') == 'on'
        
        if not name:
            messages.error(request, 'Заполните название проекта')
            return render(request, 'admin_panel/projects/form.html', {
                'project': project, 
                'title': 'Редактирование проекта'
            })
        
        project.name = name
        project.category = category
        project.client = client
        project.description = description
        project.link = link
        project.result = result
        project.sort_order = int(sort_order) if sort_order else 0
        project.status = status
        project.is_active = is_active

        if request.FILES.get('image'):
            if project.image:
                try:
                    if os.path.isfile(project.image.path):
                        os.remove(project.image.path)
                except Exception as e:
                    print(f"Ошибка удаления старого изображения: {e}")
            project.image = request.FILES.get('image')
        
        project.save()
        messages.success(request, f'Проект "{name}" успешно обновлён')
        return redirect('admin_projects')
    
    return render(request, 'admin_panel/projects/form.html', {
        'project': project, 
        'title': 'Редактирование проекта'
    })

@permission_required(['full'])
def admin_project_delete(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    if request.method == 'POST':
        with connection.cursor() as cursor:
            cursor.execute('DELETE FROM portfolio_projects WHERE id = %s', [project.id])
        messages.success(request, 'Проект удалён')
        return redirect('admin_projects')
    return render(request, 'admin_panel/projects/confirm_delete.html', {'project': project})

@permission_required(['full'])
def admin_project_toggle(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    project.is_active = not project.is_active
    project.save()
    return JsonResponse({
        'success': True, 
        'is_active': project.is_active
    })