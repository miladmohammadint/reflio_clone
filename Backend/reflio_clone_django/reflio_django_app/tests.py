from django.test import TestCase, Client
from django.contrib.auth.models import User

class CompanyDetailsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.login(username='testuser', password='testpassword')
    
    def test_get_company_details(self):
        response = self.client.get('/api/get_company_details')
        self.assertEqual(response.status_code, 200)
        print(response.json())

# To run the test, use the Django test runner:
# python manage.py test
