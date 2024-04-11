"""reflio_clone_django URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from reflio_django_app import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/signin/', views.signin, name='signin'), #maps to Auth.js
    path('api/signup/', views.signup, name='signup'), #maps to Auth.js
    path('api/user/details/', views.user_details_view, name='user_details'),  # New URL pattern for user details
    path('accounts/', include('django.contrib.auth.urls')),
    path('api/signout/', views.signout, name='signout'),  # New URL pattern for signout
]