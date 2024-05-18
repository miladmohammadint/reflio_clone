# signals.py

from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

@receiver(post_save, sender=get_user_model())
def assign_user_to_default_group(sender, instance, created, **kwargs):
    if created:
        default_group, created = Group.objects.get_or_create(name='User')
        instance.groups.add(default_group)
        print(f"User {instance.username} assigned to default group.")  # Add this line to verify if the signal handler function is executed
