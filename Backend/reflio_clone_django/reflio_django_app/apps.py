from django.apps import AppConfig

class ReflioDjangoAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reflio_django_app'

    def ready(self):
        import reflio_django_app.signals  # Import the signals module from your app
