from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile

from .utils import send_activation_email

class UserRegistrationSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=100, required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('full_name','email', 'password', 'password_confirm')
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email is already registered."})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        full_name = validated_data.pop('full_name')
        email = validated_data['email']
        username=email
    
        # Create user with the new username
        user = User.objects.create(
            username=username, 
            email=email,
            first_name=full_name.split(' ')[0], # Save first part as first_name
            last_name=' '.join(full_name.split(' ')[1:]), # Save rest as last_name
            is_active=False
        )
        
        user.set_password(validated_data['password'])
        user.save()
        send_activation_email(user)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    
    class Meta:
        model = UserProfile
        fields = ('full_name', 'email')