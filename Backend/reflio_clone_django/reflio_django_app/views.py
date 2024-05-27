from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Company, Team, UserDetails, Campaign
from django.views.decorators.cache import never_cache
import logging
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from .models import UserDetails  # Import UserDetails model
from django.middleware import csrf
import uuid
from django.views.generic import View



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
    
@csrf_exempt
@ensure_csrf_cookie
@api_view(['POST', 'GET'])
def create_company(request):
    if request.method == 'POST':
        # Logging request headers
        logger.info('Request Headers: %s', request.headers)
        
        # Extract company data from the request
        company_name = request.data.get('company_name')
        company_url = request.data.get('company_url')
        company_handle = request.data.get('company_handle')
        team_id = request.data.get('team_id')
        # Other company fields...
        
        if not company_name:
            return JsonResponse({'error': 'Company name is required'}, status=400)
        if not company_url:
            return JsonResponse({'error': 'Company URL is required'}, status=400)
        if not company_handle:
            return JsonResponse({'error': 'Company handle is required'}, status=400)
        if not team_id:
            return JsonResponse({'error': 'Team ID is required'}, status=400)
        
        # Retrieve the team based on team_id
        try:
            team = Team.objects.get(team_id=team_id)
        except Team.DoesNotExist:
            return JsonResponse({'error': 'Team not found'}, status=404)

        # Create a new Company object and save it to the database
        company = Company.objects.create(
            user=team.user,  # Assuming user is associated with the team
            team=team,
            company_name=company_name,
            company_url=company_url,
            company_handle=company_handle,
            # Other fields...
        )

        # Construct redirect URL to localhost:3000
        redirect_url = 'http://localhost:3000/'  # Modify this if the URL is different
        
        # Return a JSON response indicating success and including redirect URL
        response_data = {'success': True, 'redirect_url': redirect_url}
        response = JsonResponse(response_data)
        
        # Include CSRF token in the response headers
        csrf_token = csrf.get_token(request)
        response['X-CSRFToken'] = csrf_token
        
        return response
    elif request.method == 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@api_view(['GET'])
@csrf_exempt
def get_company_details(request):
    if request.method == 'GET':
        user = request.user
        companies = Company.objects.filter(user=user).values()  # Filter by user
        
        return JsonResponse(list(companies), safe=False)
    else:
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

@csrf_exempt
def create_campaign(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            user_id = data.get('user')
            team_id = data.get('team')  # Ensure team_id is passed correctly
            campaign_name = data.get('campaign_name')
            commission_type = data.get('commission_type')
            commission_value = data.get('commission_value')
            company_id = data.get('company')
            cookie_window = data.get('cookie_window', 60)
            commission_period = data.get('commission_period', 12)
            default_campaign = data.get('default_campaign', False)
            campaign_public = data.get('campaign_public', True)
            minimum_days_payout = data.get('minimum_days_payout', 30)
            discount_code = data.get('discount_code', None)
            discount_value = data.get('discount_value', None)
            discount_type = data.get('discount_type', None)
            custom_campaign_data = data.get('custom_campaign_data', {})

            user = User.objects.get(id=user_id)
            team = Team.objects.get(team_id=team_id)  # Ensure team_id is passed correctly as a UUID
            company = Company.objects.get(company_id=company_id)

            campaign = Campaign.objects.create(
                user=user,
                team=team,
                campaign_name=campaign_name,
                commission_type=commission_type,
                commission_value=commission_value,
                company=company,
                cookie_window=cookie_window,
                commission_period=commission_period,
                default_campaign=default_campaign,
                campaign_public=campaign_public,
                minimum_days_payout=minimum_days_payout,
                discount_code=discount_code,
                discount_value=discount_value,
                discount_type=discount_type,
                custom_campaign_data=custom_campaign_data
            )

            response_data = {
                'campaign_id': campaign.campaign_id,
                'campaign_name': campaign.campaign_name,
                'commission_type': campaign.commission_type,
                'commission_value': campaign.commission_value,
                'company': campaign.company.company_name,
                'cookie_window': campaign.cookie_window,
                'commission_period': campaign.commission_period,
                'default_campaign': campaign.default_campaign,
                'campaign_public': campaign.campaign_public,
                'minimum_days_payout': campaign.minimum_days_payout,
                'discount_code': campaign.discount_code,
                'discount_value': campaign.discount_value,
                'discount_type': campaign.discount_type,
                'custom_campaign_data': campaign.custom_campaign_data,
                'created': campaign.created
            }

            return JsonResponse(response_data, status=201)

        except User.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=400)
        except Team.DoesNotExist:
            return JsonResponse({'error': 'Team does not exist'}, status=400)
        except Company.DoesNotExist:
            return JsonResponse({'error': 'Company does not exist'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def campaign_details(request):
    if request.method == 'POST':
        # Assuming you have a Campaign model in your Django app
        referral_code = request.POST.get('referralCode')
        company_id = request.POST.get('companyId')

        try:
            # Replace Campaign with your actual model name
            campaign = Campaign.objects.get(referral_code=referral_code, company_id=company_id)
            # Serialize the campaign data as needed
            campaign_data = {
                'id': campaign.id,
                'name': campaign.name,
                # Add other campaign attributes as needed
            }
            return JsonResponse(campaign_data)
        except Campaign.DoesNotExist:
            return JsonResponse({'error': 'Campaign not found'}, status=404)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
