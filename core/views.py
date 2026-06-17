from django.shortcuts import render
from leads.models import Service, Project


def index(request):
    """Главная страница"""
    services = Service.objects.filter(is_active=True).order_by('order')[:6]
    projects = Project.objects.filter(is_active=True).order_by('-created_at')[:6]
    return render(request, 'core/index.html', {
        'services': services,
        'projects': projects
    })


def about(request):
    """Страница 'О нас'"""
    return render(request, 'core/about.html')


def contacts(request):
    """Страница контактов"""
    return render(request, 'core/contacts.html')


def services(request):
    """Страница услуг"""
    services = Service.objects.filter(is_active=True).order_by('order')
    return render(request, 'core/services.html', {
        'services': services
    })


def portfolio(request):
    """Страница портфолио"""
    projects = Project.objects.filter(is_active=True).order_by('-created_at')
    return render(request, 'core/portfolio.html', {
        'projects': projects
    })