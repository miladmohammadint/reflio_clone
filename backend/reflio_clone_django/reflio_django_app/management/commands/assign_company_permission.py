from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Assign custom permissions for managing companies to the default user group'

    def handle(self, *args, **kwargs):
        # Define Permission
        can_add_company_permission = Permission.objects.get(codename='custom_add_company')
        can_change_company_permission = Permission.objects.get(codename='custom_change_company')
        can_delete_company_permission = Permission.objects.get(codename='custom_delete_company')

        # Assign Permissions to Default Group
        def assign_permission_to_default_group():
            default_group, created = Group.objects.get_or_create(name='User')
            default_group.permissions.add(
                can_add_company_permission,
                can_change_company_permission,
                can_delete_company_permission
            )

        # Call the function to assign permissions to the default group
        assign_permission_to_default_group()

        self.stdout.write(self.style.SUCCESS('Successfully assigned permissions to the default user group.'))