from django.shortcuts import render
from rest_framework import generics
from django.http import JsonResponse
from .models import Campaign
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required  # Import login_required decorator

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
        try:
            # Try to load JSON data from the request body
            data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            # If decoding JSON fails, assume it's form data
            data = request.POST

        # Extract the email and password
        email = data.get('email')
        password = data.get('password')

        # Check if email and password are provided
        if not (email and password):
            return JsonResponse({'error': 'Email and password are required'}, status=400)

        # Create a new user
        user = User.objects.create_user(email=email, password=password)

        if user is not None:
            # Automatically log in the user after signup
            login(request, user)
            return JsonResponse({'message': 'Signup successful'})
        else:
            return JsonResponse({'error': 'Failed to create user'}, status=500)
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
