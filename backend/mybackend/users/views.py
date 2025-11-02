from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer
from .models import UserProfile

from .utils import send_activation_email, send_password_reset_email
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

# --- For the new password validators ---
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Registration successful. Please check your email to activate your account.',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user_instance= None
        try:
            user_instance = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        

        user = authenticate(username=user_instance.username, password=password)
        if user is not None:
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'full_name': user.userprofile.full_name
                }
            })
        else:
            if not user_instance.is_active:
                return Response({
                    'error': 'Account not activated. Please check your email'
                }, status=status.HTTP_401_UNAUTHORIZED)
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def activate_user(request):
    try:
        uidb64 = request.data.get('uidb64')
        token = request.data.get('token')
        
        if not uidb64 or not token:
             return Response({'error': 'Missing token or user ID'}, status=status.HTTP_400_BAD_REQUEST)

        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    
    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({'message': 'Account activated successfully'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Activation link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_activation(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        
        if not user.is_active:
            # If user exists and is not active, send a new email
            send_activation_email(user)
        
        # Whether the user exists or not, or is active or not,
        # send a generic success message. This prevents attackers
        # from "fishing" for registered email addresses.
        return Response({
            'message': 'If an account with that email exists and is not active, a new activation link has been sent.'
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        # Send the same generic message
        return Response({
            'message': 'If an account with that email exists and is not active, a new activation link has been sent.'
        }, status=status.HTTP_200_OK)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        
        # We check if they are active, but we'll send the email anyway
        # This is a security measure to not reveal if an email is registered.
        # The important part is that we find a user.
        
        send_password_reset_email(user)
        
    except User.DoesNotExist:
        # We do nothing if the user doesn't exist,
        # but we send a generic success response to prevent email "fishing".
        pass 

    return Response({
        'message': 'If an account with that email exists, a password reset link has been sent.'
    }, status=status.HTTP_200_OK)


# --- NEW VIEW 2: Confirm Password Reset ---
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    uidb64 = request.data.get('uidb64')
    token = request.data.get('token')
    password = request.data.get('password')
    password_confirm = request.data.get('password_confirm')

    if not all([uidb64, token, password, password_confirm]):
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if password != password_confirm:
        return Response({'password': "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        try:
            # Validate the new password
            validate_password(password, user)
        except ValidationError as e:
            # Return password validation errors
            return Response({'password': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set the new password
        user.set_password(password)
        user.save()
        return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Reset link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    profile = UserProfile.objects.get(user=request.user)
    serializer = UserProfileSerializer(profile)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated]) # This ensures only logged-in users can see it
def check_auth_status(request):
    

    profile, created = UserProfile.objects.get_or_create(user=request.user)
    if created and not profile.full_name:
        profile.full_name = request.user.get_full_name() or request.user.username
        profile.save()

    if request.user.is_authenticated:
        return Response({
            'is_authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'full_name': profile.full_name # Now this is safe to access
            }
        })
    
    return Response({'is_authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)