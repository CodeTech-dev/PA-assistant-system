from django.urls import path
from .views import ContactListCreate, ContactRetrieveUpdateDestroy

urlpatterns = [
    path('', ContactListCreate.as_view(), name='contact-list-create'),
    path('<int:pk>/', ContactRetrieveUpdateDestroy.as_view(), name='contact-detail'),
]