from django.shortcuts import render

# Create your views here.
from rest_framework import generics

#Map to CampaignFormDjango.js
from django.http import JsonResponse
from .models import Campaign

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