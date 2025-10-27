from django.urls import path
from .views import AppointmentListCreate, AppointmentRetrieveUpdateDestroy

urlpatterns = [
    path('', AppointmentListCreate.as_view(), name='appointment-list-create'),
    path('<int:pk>/', AppointmentRetrieveUpdateDestroy.as_view(), name='appointment-detail'),
]