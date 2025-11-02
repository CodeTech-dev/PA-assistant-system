from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings


def send_activation_email(user, site_domain="localhost:3000"):
    """
    Generates and sends an activation email to the user.
    """
    token = default_token_generator.make_token(user)
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

    # This URL must point to your REACT frontend activation page
    activation_link = f"http://{site_domain}/activate/{uidb64}/{token}/"

    subject = "Activate Your PAs Assistant Account"
    message = f"""
    Hi {user.first_name},

    Please click the link below to activate your account:
    {activation_link}

    If you did not request this, please ignore this email.

    Thanks,
    The PAs Assistant Team
    """

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL, # Make sure to set this in settings.py
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_password_reset_email(user, site_domain="localhost:3000"):
    """
    Generates and sends a password reset email to the user.
    """
    token = default_token_generator.make_token(user)
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

    # --- IMPORTANT ---
    # This URL must point to your NEW REACT password reset page
    reset_link = f"http://{site_domain}/password-reset-confirm/{uidb64}/{token}/"

    subject = "Reset Your PAs Assistant Password"
    message = f"""
    Hi {user.first_name},

    We received a request to reset your password. Please click the link below to set a new password:
    {reset_link}

    If you did not request this, please ignore this email.

    Thanks,
    The PAs Assistant Team
    """

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )