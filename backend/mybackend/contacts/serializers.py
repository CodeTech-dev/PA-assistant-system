from rest_framework import serializers
from .models import Contact

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'phone', 'company', 'title', 'created_at']
        read_only_fields = ['id', 'created_at'] # Owner is set in the view