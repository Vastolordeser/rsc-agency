from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import authenticate
from .models import User
from leads.models import Client


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    username = forms.CharField()
    first_name = forms.CharField(required=True, label='Имя')
    last_name = forms.CharField(required=False, label='Фамилия')
    patronymic = forms.CharField(required=False, label='Отчество')
    password1 = forms.CharField(widget=forms.PasswordInput())
    password2 = forms.CharField(widget=forms.PasswordInput())
    phone = forms.CharField(required=True)

    def clean_username(self):
        username = self.cleaned_data.get('username')
        username = username.strip()
        if ' ' in username:
            raise forms.ValidationError('Логин не может содержать пробелы')
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError('Пользователь с таким логином уже существует')
        return username

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError('Пароли не совпадают')
        return password2

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('Пользователь с таким email уже существует')
        return email

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'phone', 'password1', 'password2']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data.get('email')
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        user.phone = self.cleaned_data.get('phone', '')
        
        if commit:
            user.save()
            Client.objects.create(
                user=user,
                first_name=self.cleaned_data.get('first_name', ''),
                last_name=self.cleaned_data.get('last_name', ''),
                patronymic=self.cleaned_data.get('patronymic', ''),
                email=self.cleaned_data.get('email'),
                phone=self.cleaned_data.get('phone'),
            )
        return user


class LoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Логин'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Пароль'}))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.error_messages['invalid_login'] = 'Неверный логин или пароль'