from django.core.mail import send_mail
from django.conf import settings

def send_appointment_creation_email(user, appointment):
    # Format the date and time for the email
    date_str = appointment.date.strftime('%A, %B %d, %Y')
    time_str = ""
    if appointment.time:
        time_str = appointment.time.strftime('%I:%M %p')

    subject = "Your Appointment has been Confirmed!"
    message = f"""
    Hi {user.first_name},

    This is a confirmation that your new appointment has been scheduled:

    Title: {appointment.title}
    Date: {date_str}
    Time: {time_str if time_str else "All-day"}
    
    Location: {appointment.location if appointment.location else "Not specified"}

    You can view and manage your appointments in the app.

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