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
from rest_framework.authtoken.views import ObtainAuthToken
from reflio_django_app.views import campaign_details, get_company_details



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/signin/', views.signin, name='signin'),  # Maps to Auth.js
    path('api/signup/', views.signup, name='signup'),  # Maps to Auth.js
    path('api/user/details/', views.user_details_view, name='user_details_view'),  # New URL pattern for user details
    path('api/company/create', views.create_company, name='create_company'),  # New URL pattern for creating a company
    path('api/get_company_details/', views.get_company_details, name='get_company_details'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('api/signout/', views.signout, name='signout'),  # New URL pattern for signout
    path('api/team/', views.get_team, name='get_team'),
    path('api/subscription', views.get_subscription, name='get_subscription'),
    path('api/token/', ObtainAuthToken.as_view(), name='api_token_auth'),
    path('api/campaigns/create/', views.create_campaign, name='create-campaign'),
    path('api/campaign-details/<uuid:company_id>/<uuid:campaign_id>/', campaign_details, name='campaign_details'),
    path('api/get_campaigns/', views.get_campaigns, name='get_campaigns'),
    path('api/get_referrals/', views.get_referrals, name='get_referrals'),
    path('api/get_sales/', views.get_sales, name='get_sales'),
    path('api/continue_without_stripe/', views.continue_without_stripe, name='continue_without_stripe'),
    path('get_affiliates/', views.get_affiliates, name='get_affiliates'),
    path('api/get_reflio_commissions_due/', views.get_reflio_commissions_due, name='get_reflio_commissions_due'),
    path('api/pay_commissions/', views.pay_commissions, name='pay_commissions'),
    path('api/new_team/', views.new_team, name='new_team'),
    path('api/edit_campaign/', views.edit_campaign, name='edit_campaign'),
    path('api/edit_campaign_meta/', views.edit_campaign_meta, name='edit_campaign_meta'),
    path('api/new_stripe_account/', views.new_stripe_account, name='new_stripe_account'),
    path('api/manually_verify_domain/', views.manually_verify_domain, name='manually_verify_domain'),
    path('api/delete_affiliate/', views.delete_affiliate, name='delete_affiliate'),
    path('api/delete_company/', views.delete_company, name='delete_company'),
    path('api/edit_currency/', views.edit_currency, name='edit_currency'),
    path('api/edit_company_website/', views.edit_company_website, name='edit_company_website'),
    path('api/disable_emails/', views.disable_emails, name='disable_emails'),
    path('api/archive_submission/', views.archive_submission, name='archive_submission'),
    path('api/upload_logo_image/', views.upload_logo_image, name='upload_logo_image'),
    path('api/reset_password/', views.reset_password, name='reset_password'),
    path('api/create_referral/', views.create_referral, name='create_referral'),
]
