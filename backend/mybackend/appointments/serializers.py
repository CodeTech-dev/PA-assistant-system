from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        # We list the new fields from our model
        # If you used 'attendees_text', replace 'attendees' with 'attendees_text'
        fields = [
            'id', 
            'owner',
            'title', 
            'date', 
            'time', 
            'location', 
            'notes', 
            'attendees', 
            'created_at'
        ]
        read_only_fields = ['owner']