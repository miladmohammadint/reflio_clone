# Generated by Django 4.1.4 on 2024-03-26 19:40

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import reflio_django_app.models
import uuid



class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Affiliate',
            fields=[
                ('team_id', models.TextField()),
                ('affiliate_id', models.TextField(default='generate_uid(20)', primary_key=True, serialize=False, unique=True)),
                ('invite_email', models.TextField(null=True)),
                ('invited_user_id', models.UUIDField(default=None, null=True)),
                ('campaign_id', models.UUIDField(null=True)),
                ('company_id', models.TextField(null=True)),
                ('accepted', models.BooleanField(default=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('impressions', models.IntegerField(default=0)),
                ('referral_code', models.TextField(null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'affiliates',
            },
        ),
        migrations.CreateModel(
            name='Campaign',
            fields=[
                ('campaign_id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)),
                ('campaign_name', models.CharField(max_length=255)),
                ('commission_type', models.CharField(choices=[('percentage', 'Percentage'), ('fixed', 'Fixed')], max_length=20)),
                ('commission_value', models.IntegerField()),
                ('cookie_window', models.IntegerField(default=60)),
                ('commission_period', models.IntegerField(default=12)),
                ('default_campaign', models.BooleanField(default=False)),
                ('campaign_public', models.BooleanField(default=True)),
                ('minimum_days_payout', models.IntegerField(default=30)),
                ('discount_code', models.CharField(blank=True, max_length=255, null=True)),
                ('discount_value', models.IntegerField(blank=True, null=True)),
                ('discount_type', models.CharField(blank=True, choices=[('percentage', 'Percentage'), ('fixed', 'Fixed')], max_length=20, null=True)),
                ('custom_campaign_data', models.JSONField(blank=True, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('product_id', models.CharField(max_length=255, primary_key=True, serialize=False)),
                ('active', models.BooleanField()),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('image', models.URLField()),
                ('metadata', models.JSONField()),
            ],
        ),
        migrations.CreateModel(
            name='Team',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('team_id', models.CharField(default=reflio_django_app.models.generate_uid, max_length=15, unique=True)),
                ('team_name', models.CharField(blank=True, max_length=255, null=True)),
                ('billing_address', models.JSONField(null=True)),
                ('payment_method', models.JSONField(null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('username', models.CharField(max_length=150, unique=True)),
                ('full_name', models.CharField(max_length=150)),
                ('avatar_url', models.URLField(blank=True, null=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('paypal_email', models.EmailField(blank=True, max_length=254, null=True)),
                ('user_type', models.CharField(choices=[('platform', 'Platform'), ('user', 'User')], max_length=10)),
                ('team', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='reflio_django_app.team')),
            ],
        ),
        migrations.CreateModel(
            name='Subscription',
            fields=[
                ('id', models.CharField(max_length=255, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('trialing', 'Trialing'), ('active', 'Active'), ('canceled', 'Canceled'), ('incomplete', 'Incomplete'), ('incomplete_expired', 'Incomplete Expired')], max_length=20)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.team')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Referral',
            fields=[
                ('team_id', models.TextField()),
                ('referral_id', models.TextField(default='generate_uid(20)', primary_key=True, serialize=False, unique=True)),
                ('affiliate_code', models.TextField(null=True)),
                ('campaign_id', models.UUIDField(null=True)),
                ('company_id', models.TextField(null=True)),
                ('referral_reference_email', models.TextField(null=True)),
                ('commission_type', models.TextField(null=True)),
                ('commission_value', models.IntegerField(null=True)),
                ('cookie_window', models.IntegerField(default=60)),
                ('commission_period', models.IntegerField(default=12)),
                ('minimum_days_payout', models.IntegerField(default=30)),
                ('referral_converted', models.BooleanField(default=False)),
                ('referral_expiry', models.TextField(null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('affiliate_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.affiliate')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'referrals',
            },
        ),
        migrations.CreateModel(
            name='Price',
            fields=[
                ('id', models.CharField(max_length=255, primary_key=True, serialize=False)),
                ('active', models.BooleanField()),
                ('description', models.TextField()),
                ('unit_amount', models.BigIntegerField()),
                ('currency', models.CharField(max_length=3)),
                ('type', models.CharField(choices=[('one_time', 'One-time'), ('recurring', 'Recurring')], max_length=20)),
                ('interval', models.CharField(choices=[('day', 'Day'), ('week', 'Week'), ('month', 'Month'), ('year', 'Year')], max_length=5)),
                ('interval_count', models.IntegerField()),
                ('trial_period_days', models.IntegerField()),
                ('metadata', models.JSONField()),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.product')),
            ],
        ),
        migrations.CreateModel(
            name='Member',
            fields=[
                ('member_id', models.CharField(default=reflio_django_app.models.generate_uid, max_length=15, primary_key=True, serialize=False, unique=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('member_team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.team')),
                ('member_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Invite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invite_id', models.CharField(default=reflio_django_app.models.generate_uid, max_length=15, unique=True)),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
                ('accepted', models.BooleanField(default=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.team')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stripe_customer_id', models.CharField(max_length=255)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.team')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Company',
            fields=[
                ('company_id', models.UUIDField(default=reflio_django_app.models.generate_uid, primary_key=True, serialize=False, unique=True)),
                ('company_name', models.CharField(max_length=255)),
                ('company_url', models.URLField(blank=True, null=True)),
                ('company_image', models.URLField(blank=True, null=True)),
                ('company_meta', models.JSONField(null=True)),
                ('company_currency', models.CharField(max_length=3)),
                ('company_handle', models.CharField(blank=True, max_length=255, null=True, unique=True)),
                ('company_affiliates', models.JSONField(null=True)),
                ('stripe_account_data', models.JSONField(null=True)),
                ('domain_verified', models.BooleanField(default=False)),
                ('stripe_id', models.CharField(blank=True, max_length=255, null=True)),
                ('active_company', models.BooleanField(default=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.team')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Commission',
            fields=[
                ('commission_id', models.CharField(default=reflio_django_app.models.generate_uid, max_length=20, primary_key=True, serialize=False, unique=True)),
                ('payment_intent_id', models.CharField(max_length=255)),
                ('commission_sale_value', models.IntegerField(blank=True, null=True)),
                ('commission_refund_value', models.IntegerField(blank=True, null=True)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('reflio_commission_paid', models.BooleanField(default=False)),
                ('commission_total', models.IntegerField(blank=True, null=True)),
                ('commission_due_date', models.DateTimeField(blank=True, null=True)),
                ('commission_description', models.TextField(blank=True, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('affiliate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.affiliate')),
                ('campaign', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.Campaign', null=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.company')),
                ('referral', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.referral')),
            ],
        ),
        migrations.AddField(
            model_name='campaign',
            name='company',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.company'),
        ),
        migrations.AddField(
            model_name='campaign',
            name='team',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.team'),
        ),
        migrations.AddField(
            model_name='campaign',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Asset',
            fields=[
                ('asset_id', models.CharField(default=reflio_django_app.models.generate_uid, max_length=15, primary_key=True, serialize=False, unique=True)),
                ('file_name', models.CharField(blank=True, max_length=255, null=True)),
                ('file_custom_name', models.CharField(blank=True, max_length=255, null=True)),
                ('file_size', models.IntegerField(blank=True, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.company')),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reflio_django_app.team')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
