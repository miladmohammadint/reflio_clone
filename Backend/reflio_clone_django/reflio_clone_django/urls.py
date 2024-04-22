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
    path('api/signin/', views.signin, name='signin'),  # Maps to Auth.js
    path('api/signup/', views.signup, name='signup'),  # Maps to Auth.js
    path('api/user/details', views.user_details_view, name='user_details_view'),  # New URL pattern for user details
    path('api/company/create', views.create_company, name='create_company'),  # New URL pattern for creating a company
    path('accounts/', include('django.contrib.auth.urls')),
    path('api/signout/', views.signout, name='signout'),  # New URL pattern for signout
    path('api/team/', views.get_team, name='get_team'),
    path('api/subscription', views.get_subscription, name='get_subscription'),
    path('api/team', views.get_team, name='get_team'),  # Map the view function to the /api/team endpoint
]
