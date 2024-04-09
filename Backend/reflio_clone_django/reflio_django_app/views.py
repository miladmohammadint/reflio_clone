from django.shortcuts import render
from rest_framework import generics
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.decorators import login_required  # Import login_required decorator
from django.contrib.auth.models import User  # Import User model

@csrf_exempt
def signin(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        # Check if the user exists
        user = User.objects.filter(username=username).first()
        if not user:
            return JsonResponse({'error': 'User does not exist'}, status=400)

        # Authenticate the user
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
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        redirectTo = data.get('redirectTo')

        # Check if the user already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'User already exists'}, status=400)

        # Create a new user
        user = User.objects.create_user(username=username, email=email, password=password)

        if user is not None:
            # Log in the user
            login(request, user)
            return JsonResponse({'message': 'Signup successful', 'redirectTo': redirectTo})
        else:
            return JsonResponse({'error': 'Failed to create user'}, status=400)
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

@csrf_exempt
def signout(request):
    if request.method == 'POST':
        # Log out the user
        logout(request)
        return JsonResponse({'message': 'Signout successful'})
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

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
