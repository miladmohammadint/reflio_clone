from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('reflio_django_app', '0007_alter_affiliate_affiliate_id_alter_campaign_user'),
    ]

    operations = [
        # Drop the foreign key constraint first
        migrations.RunSQL(
            sql="ALTER TABLE reflio_django_app_commission DROP CONSTRAINT reflio_django_app_co_affiliate_id_5d06643e_fk_affiliate;",
            reverse_sql="ALTER TABLE reflio_django_app_commission ADD CONSTRAINT reflio_django_app_co_affiliate_id_5d06643e_fk_affiliate FOREIGN KEY (affiliate_id) REFERENCES reflio_django_app_affiliate(affiliate_id);",
        ),
        # Then alter the field to UUID
        migrations.AlterField(
            model_name='affiliate',
            name='affiliate_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, serialize=False),
        ),
        migrations.AlterField(
            model_name='member',
            name='member_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, serialize=False),
        ),
    ]
