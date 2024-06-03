from rest_framework import serializers
from .models import Campaign  # Adjust the import based on your project structure

class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = ['campaign_id', 'campaign_name', 'company_id']