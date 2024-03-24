from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Campaign
from .serializers import CampaignSerializer

class CampaignListView(generics.ListCreateAPIView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer

class CampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer