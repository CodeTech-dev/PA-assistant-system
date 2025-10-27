from rest_framework import generics, permissions
from .models import Appointment
from .serializers import AppointmentSerializer

class AppointmentListCreate(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter appointments by the logged-in user [cite: 4]
        return Appointment.objects.filter(owner=self.request.user).order_by('date', 'time')

    def perform_create(self, serializer):
        # Automatically set the owner when creating [cite: 5]
        serializer.save(owner=self.request.user)
    

class AppointmentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(owner=self.request.user)