from django.db import models

# Create your models here.

#CampaignForm.js corresponding model

class Campaign(models.Model):
    campaign_name = models.CharField(max_length=255)
    commission_type = models.CharField(max_length=20, choices=[('percentage', 'Percentage of sale'), ('fixed', 'Fixed amount')])
    commission_value = models.DecimalField(max_digits=10, decimal_places=2)
    cookie_window = models.IntegerField(default=60)
    commission_period = models.IntegerField()
    minimum_days_payout = models.IntegerField()
    campaign_public = models.BooleanField(default=True)
    discount_type = models.CharField(max_length=20, choices=[('percentage', 'Percentage'), ('fixed', 'Fixed amount')], null=True, blank=True)
    discount_code = models.CharField(max_length=100, null=True, blank=True)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    default_campaign = models.BooleanField(default=False)
