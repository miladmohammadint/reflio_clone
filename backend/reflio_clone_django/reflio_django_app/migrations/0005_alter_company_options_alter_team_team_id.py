# Generated by Django 4.1.4 on 2024-04-24 20:42

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('reflio_django_app', '0004_alter_company_company_id'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='company',
            options={'permissions': [('custom_add_company', 'Can add company'), ('custom_change_company', 'Can change company'), ('custom_delete_company', 'Can delete company')]},
        ),
        migrations.AlterField(
            model_name='team',
            name='team_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
