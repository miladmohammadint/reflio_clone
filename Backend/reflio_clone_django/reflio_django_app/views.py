from django.shortcuts import render
from django.middleware.csrf import get_token  # Import get_token to generate CSRF token
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.decorators import login_required  # Import login_required decorator
from django.contrib.auth.models import User  # Import User model
from .models import Company, Team, UserDetails  # Import UserDetails model
from django.views.decorators.cache import never_cache
import logging  # Import logging module

logger = logging.getLogger(__name__)  # Initialize logger

@never_cache
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

@never_cache
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

@api_view(['POST'])
def create_company(request):
    if request.method == 'POST':
        # Logging request headers
        logger.info('Request Headers: %s', request.headers)
        
        # Extract company data from the request
        company_name = request.data.get('company_name')
        company_url = request.data.get('company_url')
        company_handle = request.data.get('company_handle')
        # Other company fields...
        
        # Create a new Company object and save it to the database
        company = Company.objects.create(
            company_name=company_name,
            company_url=company_url,
            company_handle=company_handle,
            # Other fields...
        )

        # Construct redirect URL to localhost:3000
        redirect_url = 'http://localhost:3000/'  # Modify this if the URL is different
        
        # Return a JSON response indicating success and including redirect URL
        return JsonResponse({'success': True, 'redirect_url': redirect_url})
    else:
        # Return an error response for non-POST requests
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@never_cache
@csrf_exempt
def signout(request):
    if request.method == 'POST':
        # Log out the user
        logout(request)
        return JsonResponse({'message': 'Signout successful'})
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@never_cache
@csrf_exempt
@api_view(['GET'])  # Specify the allowed HTTP methods
def user_details_view(request):
    if request.method == 'GET':
        print(request)
        # Fetch user details
        print(request.user)
        if request.user.is_authenticated:
            # Fetch user details
            user_details = UserDetails.objects.get(user=request.user)  # Assuming UserDetails is related to the User model
            # Serialize user details as needed
            user_data = {
                'username': request.user.username,
                'email': request.user.email,
                # Add other user details
            }
            return JsonResponse(user_data)
        else:
            return JsonResponse({'error': 'User is not authenticated'}, status=401)  # Return 200 OK status even for unauthenticated users
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@never_cache
@api_view(['GET'])
def get_team(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            try:
                # Retrieve the team details from the database
                team = Team.objects.get(user=request.user)
                team_data = {
                    'team_id': team.team_id,
                    'team_name': team.team_name,
                    'billing_address': team.billing_address,
                    'payment_method': team.payment_method,
                    'created': team.created
                    # Add other fields as needed
                }
                return JsonResponse(team_data)
            except Team.DoesNotExist:
                return JsonResponse({'error': 'Team not found'}, status=404)
        else:
            return JsonResponse({'error': 'User is not authenticated'}, status=401)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def get_subscription(request):
    # Perform any necessary logic to fetch subscription details from the database
    # For example, you might retrieve subscription details associated with the currently logged-in user
    subscription_details = {
        'plan_name': 'Basic Plan',
        'price': 9.99,
        # Add other subscription details as needed
    }
    return JsonResponse(subscription_details)
