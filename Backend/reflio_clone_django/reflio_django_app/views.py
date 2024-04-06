from django.shortcuts import render
from rest_framework import generics
from django.http import JsonResponse
from .models import Campaign
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.decorators import login_required  # Import login_required decorator
from django.contrib.auth.forms import UserCreationForm

@csrf_exempt
def signin(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Signin successful'})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
            return JsonResponse({'message': 'Signup successful'})
        else:
            return JsonResponse({'error': 'Invalid form data'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def create_campaign(request):
    if request.method == 'POST':
        # Extract form data from the request
        campaign_name = request.POST.get('campaign_name')
        commission_type = request.POST.get('commission_type')
        commission_value = request.POST.get('commission_value')
        # Other form fields...
        
        # Create a new Campaign object and save it to the database
        campaign = Campaign.objects.create(
            campaign_name=campaign_name,
            commission_type=commission_type,
            commission_value=commission_value,
            # Other fields...
        )
        
        # Return a JSON response indicating success
        return JsonResponse({'success': True})
    else:
        # Return an error response for non-POST requests
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logout successful'})

@login_required  # Apply login_required decorator
def user_details_view(request):
    user = request.user
    user_data = {
        'username': user.username,
        'email': user.email,
        # Add other user details as needed
    }
    return JsonResponse(user_data)

# Additional views for handling user profile updates, etc. if needed
