# Generated by Django 4.1.4 on 2024-04-20 08:54

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('reflio_django_app', '0003_userdetails'),
    ]

    operations = [
        migrations.AlterField(
            model_name='company',
            name='company_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
    ]
