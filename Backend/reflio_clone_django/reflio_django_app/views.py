from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Company, Team, UserDetails
from django.views.decorators.cache import never_cache
import logging
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from .models import UserDetails  # Import UserDetails model
import uuid


logger = logging.getLogger(__name__) 

# Define the generate_team_id function
def generate_team_id():
    """
    Generate a unique team ID using UUID (Universally Unique Identifier).
    """
    return str(uuid.uuid4())

@never_cache
@csrf_exempt
def signin(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        # Authenticate the user
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            # Generate or retrieve token for the user
            token, created = Token.objects.get_or_create(user=user)
            return JsonResponse({'message': 'Signin successful', 'token': token.key})
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
            # Create user details
            UserDetails.objects.create(user=user)  # Create user details upon signup
            
            # Create team for the user
            team_id = generate_team_id()  # You need to implement a function to generate a unique team ID
            team = Team.objects.create(user=user, team_id=team_id)
            
            # Log in the user
            login(request, user)
            # Generate or retrieve token for the user
            token, created = Token.objects.get_or_create(user=user)
            return JsonResponse({'message': 'Signup successful', 'token': token.key, 'redirectTo': redirectTo})
        else:
            return JsonResponse({'error': 'Failed to create user'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Add this decorator to enforce authentication
def create_company(request):
    if request.method == 'POST':
        # Logging request headers
        logger.info('Request Headers: %s', request.headers)
        
        # Ensure that the user has the necessary permissions to create a company
        if not request.user.has_perm('your_app.add_company'):
            return JsonResponse({'error': 'You do not have permission to create a company'}, status=403)
        
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
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_details_view(request):
    if request.method == 'GET':
        try:
            # Fetch user details based on the user's ID
            user = request.user
            user_details = UserDetails.objects.get(user=user)
            # Construct user data to be returned in the response
            user_data = {
                'user_id': user.id,
                'username': user.username,
                # Add other user details as needed
            }
            return JsonResponse(user_data)
        except UserDetails.DoesNotExist:
            return JsonResponse({'error': 'User details not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@never_cache
@csrf_exempt
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
                # If the team doesn't exist, create a new team record
                team_id = generate_team_id()  # Generate a unique team ID
                new_team = Team.objects.create(
                    user=request.user,
                    team_id=team_id
                    # Add other fields as needed
                )
                team_data = {
                    'team_id': team_id,
                    # Add default values for other fields if necessary
                }
                return JsonResponse(team_data, status=201)  # Return HTTP 201 Created
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
