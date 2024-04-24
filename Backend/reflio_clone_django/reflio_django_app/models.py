import uuid
from django.contrib.auth.models import User
from django.db import models
from django.contrib.auth.models import Permission


def generate_uid():
    return str(uuid.uuid4())

class Team(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    team_id = models.CharField(max_length=15, unique=True, default=generate_uid)
    team_name = models.CharField(max_length=255, blank=True, null=True)
    billing_address = models.JSONField(null=True)
    payment_method = models.JSONField(null=True)
    created = models.DateTimeField(auto_now_add=True)

class Member(models.Model):
    member_id = models.CharField(max_length=15, primary_key=True, unique=True, default=generate_uid)
    member_team = models.ForeignKey(Team, on_delete=models.CASCADE)
    member_user = models.ForeignKey(User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)

class Invite(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    invite_id = models.CharField(max_length=15, unique=True, default=generate_uid)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    email = models.EmailField(null=True, blank=True)
    accepted = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    full_name = models.CharField(max_length=150)
    avatar_url = models.URLField(null=True, blank=True)
    email = models.EmailField(unique=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True)
    paypal_email = models.EmailField(null=True, blank=True)
    user_type = models.CharField(max_length=10, choices=[('platform', 'Platform'), ('user', 'User')])

class Company(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    company_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255)
    company_url = models.URLField(null=True, blank=True)
    company_image = models.URLField(null=True, blank=True)
    company_meta = models.JSONField(null=True)
    company_currency = models.CharField(max_length=3)
    company_handle = models.CharField(max_length=255, unique=True, null=True, blank=True)
    company_affiliates = models.JSONField(null=True)
    stripe_account_data = models.JSONField(null=True)
    domain_verified = models.BooleanField(default=False)
    stripe_id = models.CharField(max_length=255, null=True, blank=True)
    active_company = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        permissions = [
            ("custom_add_company", "Can add company"),
            ("custom_change_company", "Can change company"),
            ("custom_delete_company", "Can delete company"),
        ]

class Campaign(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    campaign_id = models.CharField(max_length=15, primary_key=True, unique=True, default=generate_uid)
    campaign_name = models.CharField(max_length=255)
    commission_type = models.CharField(max_length=20, choices=[('percentage', 'Percentage'), ('fixed', 'Fixed')])
    commission_value = models.IntegerField()
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    cookie_window = models.IntegerField(default=60)
    commission_period = models.IntegerField(default=12)
    default_campaign = models.BooleanField(default=False)
    campaign_public = models.BooleanField(default=True)
    minimum_days_payout = models.IntegerField(default=30)
    discount_code = models.CharField(max_length=255, null=True, blank=True)
    discount_value = models.IntegerField(null=True, blank=True)
    discount_type = models.CharField(max_length=20, choices=[('percentage', 'Percentage'), ('fixed', 'Fixed')], null=True, blank=True)
    custom_campaign_data = models.JSONField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)

class Affiliate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team_id = models.TextField()
    affiliate_id = models.TextField(primary_key=True, unique=True, default='generate_uid(20)')
    invite_email = models.TextField(null=True)
    invited_user_id = models.UUIDField(null=True, default=None)
    campaign_id = models.TextField(null=True)
    company_id = models.TextField(null=True)
    accepted = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    impressions = models.IntegerField(default=0)
    referral_code = models.TextField(null=True)

class Referral(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team_id = models.TextField()
    referral_id = models.TextField(primary_key=True, unique=True, default='generate_uid(20)')
    affiliate_id = models.ForeignKey(Affiliate, on_delete=models.CASCADE)
    affiliate_code = models.TextField(null=True)
    campaign_id = models.TextField(null=True)
    company_id = models.TextField(null=True)
    referral_reference_email = models.TextField(null=True)
    commission_type = models.TextField(null=True)
    commission_value = models.IntegerField(null=True)
    cookie_window = models.IntegerField(default=60)
    commission_period = models.IntegerField(default=12)
    minimum_days_payout = models.IntegerField(default=30)
    referral_converted = models.BooleanField(default=False)
    referral_expiry = models.TextField(null=True)
    created = models.DateTimeField(auto_now_add=True)

class Commission(models.Model):
    commission_id = models.CharField(max_length=20, primary_key=True, unique=True, default=generate_uid)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    affiliate = models.ForeignKey('Affiliate', on_delete=models.CASCADE)
    referral = models.ForeignKey('Referral', on_delete=models.CASCADE)
    payment_intent_id = models.CharField(max_length=255)
    commission_sale_value = models.IntegerField(null=True, blank=True)
    commission_refund_value = models.IntegerField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    reflio_commission_paid = models.BooleanField(default=False)
    commission_total = models.IntegerField(null=True, blank=True)
    commission_due_date = models.DateTimeField(null=True, blank=True)
    commission_description = models.TextField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)

class Asset(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    asset_id = models.CharField(max_length=15, primary_key=True, unique=True, default=generate_uid)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255, null=True, blank=True)
    file_custom_name = models.CharField(max_length=255, null=True, blank=True)
    file_size = models.IntegerField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    stripe_customer_id = models.CharField(max_length=255)
    
class Product(models.Model):
    product_id = models.CharField(max_length=255, primary_key=True)
    active = models.BooleanField()
    name = models.CharField(max_length=255)
    description = models.TextField()
    image = models.URLField()
    metadata = models.JSONField()

class Price(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    active = models.BooleanField()
    description = models.TextField()
    unit_amount = models.BigIntegerField()
    currency = models.CharField(max_length=3)
    type = models.CharField(max_length=20, choices=[('one_time', 'One-time'), ('recurring', 'Recurring')])
    interval = models.CharField(max_length=5, choices=[('day', 'Day'), ('week', 'Week'), ('month', 'Month'), ('year', 'Year')])
    interval_count = models.IntegerField()
    trial_period_days = models.IntegerField()
    metadata = models.JSONField()

class Subscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    id = models.CharField(max_length=255, primary_key=True)
    status = models.CharField(max_length=20, choices=[('trialing', 'Trialing'), ('active', 'Active'), ('canceled', 'Canceled'), ('incomplete', 'Incomplete'), ('incomplete_expired', 'Incomplete Expired')])

class UserDetails(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='details')
