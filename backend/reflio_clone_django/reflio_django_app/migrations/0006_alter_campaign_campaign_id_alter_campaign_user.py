from django.conf import settings
from django.db import migrations, models
import uuid

class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('reflio_django_app', '0005_alter_company_options_alter_team_team_id'),
    ]

    operations = [
        # Drop the existing index if it exists
        migrations.RunSQL(
            sql="DROP INDEX IF EXISTS reflio_django_app_campaign_campaign_id_idx;",
            reverse_sql="CREATE INDEX reflio_django_app_campaign_campaign_id_idx ON reflio_django_app_campaign (campaign_id);"
        ),
        # Alter the campaign_id field to UUIDField
        migrations.AlterField(
            model_name='campaign',
            name='campaign_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
    ]
