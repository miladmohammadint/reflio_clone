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
from .models import Commission
from .models import Affiliate
from .models import Referral
from django.db.models import Q
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .serializers import CampaignSerializer
from rest_framework import status


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

@csrf_exempt
@api_view(['GET'])
def get_campaigns(request):
    company_id = request.query_params.get('companyId')
    if company_id is None:
        return Response({"error": "companyId parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Fetch campaigns based on company ID
        campaigns = Campaign.objects.filter(company_id=company_id)
        campaign_data = CampaignSerializer(campaigns, many=True).data
        return Response(campaign_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
def campaign_details(request, company_id, campaign_id):
    try:
        campaign = Campaign.objects.get(company_id=company_id, campaign_id=campaign_id)
        campaign_data = CampaignSerializer(campaign).data
        return Response(campaign_data, status=status.HTTP_200_OK)
    except Campaign.DoesNotExist:
        return Response({"error": "Campaign not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
def get_sales(request):
    """
    API endpoint to fetch sales data based on filters.
    """
    if request.method == 'GET':
        company_id = request.GET.get('company_id')
        date = request.GET.get('date')
        page = request.GET.get('page')

        # Construct query based on filters
        query = Q(company_id=company_id)

        if date and page == 'due':
            query &= Q(commission_due_date__lt=date, paid_at__isnull=True)
        elif page == 'paid':
            query &= ~Q(paid_at=None)
        elif page == 'pending':
            query &= Q(commission_due_date__gt=date, paid_at__isnull=True)
        elif page == 'trial':
            query &= Q(commission_description='Trial')

        # Execute query and fetch data
        sales_data = Commission.objects.filter(query).values()
        return JsonResponse(list(sales_data), safe=False)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt    
@api_view(['POST'])
def continue_without_stripe(request):
    """
    API endpoint to continue without using Stripe for a specific company.
    """
    if request.method == 'POST':
        company_id = request.data.get('company_id')

        try:
            company = Company.objects.get(company_id=company_id)
            company.stripe_id = 'manual'
            company.stripe_account_data = 'manual'
            company.save()
            return JsonResponse({'success': True})
        except Company.DoesNotExist:
            return JsonResponse({'error': 'Company not found'}, status=404)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
@api_view(['GET'])
def get_affiliates(request):
    company_id = request.query_params.get('company_id')
    
    if not company_id:
        return Response({'error': 'Company ID is required'}, status=400)
    
    try:
        company = Company.objects.get(company_id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=404)

    affiliates = Affiliate.objects.filter(company=company).select_related('invited_user_id')

    affiliates_data = []
    for affiliate in affiliates:
        commissions = Commission.objects.filter(affiliate=affiliate, commission_due_date__lt=datetime.now())
        commission_value = sum([c.commission_sale_value for c in commissions])
        
        affiliate_data = {
            'affiliate_id': affiliate.affiliate_id,
            'invited_user_email': affiliate.invited_user_id.email if affiliate.invited_user_id else None,
            'commissions_value': commission_value,
            # Add other fields if needed
        }
        affiliates_data.append(affiliate_data)
    
    return Response(affiliates_data, status=200)

@csrf_exempt
@api_view(['GET'])
def get_referrals(request):
    company_id = request.query_params.get('company_id')
    date = request.query_params.get('date')
    page = request.query_params.get('page')

    if not company_id:
        return Response({'error': 'Company ID is required'}, status=400)

    query = Q(company_id=company_id)
    
    if date:
        query &= Q(created__lt=date)

    if page == "visited-link":
        query &= Q(referral_converted=False, referral_reference_email__isnull=True, referral_expiry__gt=datetime.now())
    elif page == "expired":
        query &= Q(referral_expiry__lt=datetime.now(), referral_reference_email__isnull=True, referral_converted=False)
    elif page == "signed-up":
        query &= Q(referral_reference_email__isnull=False, referral_converted=False)
    elif page == "converted":
        query &= Q(referral_converted=True)

    referrals = Referral.objects.filter(query).select_related('campaign', 'affiliate').order_by('-created')[:30]
    
    referral_data = []
    for referral in referrals:
        referral_data.append({
            'id': referral.id,
            'created': referral.created,
            'referral_converted': referral.referral_converted,
            'referral_reference_email': referral.referral_reference_email,
            'campaign': {
                'campaign_id': referral.campaign.campaign_id,
                'campaign_name': referral.campaign.campaign_name,
            },
            'affiliate': {
                'affiliate_id': referral.affiliate.affiliate_id,
                'vercel_username': referral.affiliate.vercel_username,
                'name': referral.affiliate.name,
            }
        })

    return Response({'data': referral_data, 'count': referrals.count()})

@csrf_exempt
@api_view(['GET'])
def get_reflio_commissions_due(request):
    team_id = request.query_params.get('team_id')
    
    if not team_id:
        return JsonResponse({'error': 'Team ID is required'}, status=400)
    
    try:
        commissions = Commission.objects.filter(
            team_id=team_id,
            reflio_commission_paid=False,
            commission_due_date__lt=datetime.now(),
            paid_at__isnull=True
        ).select_related('campaign', 'affiliate__invited_user_id').order_by('-created')
        
        data = []
        for commission in commissions:
            data.append({
                'id': commission.id,
                'commission_value': commission.commission_value,
                'commission_due_date': commission.commission_due_date,
                'campaign': {
                    'id': commission.campaign.id,
                    'campaign_name': commission.campaign.campaign_name,
                },
                'affiliate': {
                    'id': commission.affiliate.id,
                    'email': commission.affiliate.invited_user_id.email,
                    'paypal_email': commission.affiliate.invited_user_id.paypal_email,
                }
            })
        
        return JsonResponse({'data': data}, safe=False)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@csrf_exempt
def pay_commissions(request):
    data = json.loads(request.body)
    company_id = data.get('companyId')
    checked_commissions = data.get('checkedCommissions')
    eligible_commissions = data.get('eligibleCommissions')

    if not company_id or not eligible_commissions:
        return Response({"error": "Invalid data"}, status=400)

    try:
        now = timezone.now().isoformat()
        if checked_commissions:
            Commission.objects.filter(commission_id__in=checked_commissions).update(paid_at=now)
        else:
            eligible_ids = [item['commission_id'] for item in eligible_commissions]
            Commission.objects.filter(commission_id__in=eligible_ids).update(paid_at=now)

        return Response({"status": "success"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@csrf_exempt
def new_team(request):
    """
    API endpoint to create a new team.
    """
    if request.method == 'POST':
        data = request.data

        # Retrieve user ID from the request
        user_id = data.get('userId')

        try:
            # Retrieve user object
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        # Extract team name from the request data
        team_name = data.get('team_name')

        if not team_name:
            return JsonResponse({'error': 'Team name is required'}, status=400)

        # Check if the team with the given name already exists for the user
        if Team.objects.filter(user=user, team_name=team_name).exists():
            return JsonResponse({'error': 'Team with the same name already exists'}, status=400)

        # Create a new team
        new_team = Team.objects.create(user=user, team_name=team_name)

        # Return success response
        return JsonResponse({'message': 'Team created successfully', 'team_id': new_team.id}, status=201)

    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
@api_view(['POST'])
def edit_campaign(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            campaign_id = data.get('campaign_id')
            form_fields = data.get('form_fields')

            # Perform your logic here to update the campaign with the provided form fields

            # Example logic:
            # Campaign.objects.filter(id=campaign_id).update(**form_fields)

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
        
@csrf_exempt
@api_view(['POST', 'GET'])
def edit_campaign_meta(request):
    if request.method == 'POST':
        # Logging request headers
        logger.info('Request Headers: %s', request.headers)
        
        # Extract campaign meta data from the request
        campaign_id = request.data.get('campaign_id')
        meta_data = request.data.get('meta_data')
        
        if not campaign_id or not meta_data:
            return JsonResponse({'status': 'error', 'message': 'Campaign ID and meta data are required'}, status=400)
        
        # Your logic to update campaign meta data goes here
        
        return JsonResponse({'status': 'success', 'message': 'Campaign meta data updated successfully'})

    # Handle GET request if needed
    return JsonResponse({'status': 'error', 'message': 'GET request not supported'}, status=405)

@csrf_exempt
def new_stripe_account(request):
    if request.method == 'POST':
        try:
            # Extract data from the request
            data = json.loads(request.body)
            user_id = data.get('userId')
            stripe_id = data.get('stripeId')
            company_id = data.get('companyId')

            # Your logic to handle the new Stripe account
            # Example:
            # Save the Stripe account details to the company in the database

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
def manually_verify_domain(request):
    if request.method == 'POST':
        try:
            # Extract data from the request
            data = json.loads(request.body)
            company_id = data.get('companyId')

            # Your logic to manually verify the domain
            # Example:
            # Update the company's domain_verified field in the database

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
def delete_affiliate(request):
    if request.method == 'POST':
        try:
            # Extract data from the request
            data = json.loads(request.body)
            affiliate_id = data.get('id')

            # Your logic to delete the affiliate
            # Example:
            # Delete the affiliate from the database

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
def delete_company(request):
    if request.method == 'POST':
        try:
            # Extract data from the request
            data = json.loads(request.body)
            company_id = data.get('id')

            # Your logic to delete the company
            # Example:
            # Delete the company from the database

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
def edit_currency(request):
    if request.method == 'POST':
        try:
            # Extract data from the request
            data = json.loads(request.body)
            company_id = data.get('companyId')
            company_currency = data.get('companyCurrency')

            # Your logic to edit the company currency
            # Example:
            # Update the company currency in the database

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
def edit_company_website(request):
    if request.method == 'POST':
        try:
            # Extract data from the request
            data = json.loads(request.body)
            company_id = data.get('companyId')
            company_url = data.get('companyUrl')

            # Your logic to edit the company website
            # Example:
            # Update the company website in the database

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
def disable_emails(request):
    if request.method == 'POST':
        try:
            # Extract data from the request
            data = json.loads(request.body)
            company_id = data.get('companyId')
            disable_type = data.get('type')

            # Your logic to disable emails
            # Example:
            # Update the disable_emails field in the database

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
def archive_submission(request):
    if request.method == 'POST':
        try:
            # Extract data from the request
            data = json.loads(request.body)
            submission_id = data.get('id')
            archive_type = data.get('type')

            # Your logic to archive submission
            # Example:
            # Update the archived field in the database

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
def upload_logo_image(request):
    if request.method == 'POST':
        try:
            # Extract data from the request
            data = json.loads(request.body)
            companyId = data.get('companyId')
            file = request.FILES.get('file')

            # Your logic to handle file upload and update company logo in the database
            # Example:
            # Save the file in your storage and update the company's logo field in the database

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
@csrf_exempt
@api_view(['POST', 'GET'])
def reset_password(request):
    if request.method == 'POST':
        try:
            token = request.data.get('token')
            password = request.data.get('password')

            # Decode the token to get user_id
            uidb64, token = token.split("-")
            uid = force_text(urlsafe_base64_decode(uidb64))

            # Check if the user exists
            user = User.objects.get(pk=uid)

            # Check if the token is valid
            if PasswordResetTokenGenerator().check_token(user, token):
                # Set the new password
                user.password = make_password(password)
                user.save()
                return JsonResponse({'status': 'success', 'message': 'Password reset successfully'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid token'})
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User does not exist'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    elif request.method == 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)