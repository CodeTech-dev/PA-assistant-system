from django.db import models
from django.contrib.auth.models import User
from contacts.models import Contact 

class Appointment(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="appointments")
    title = models.CharField(max_length=255) 
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=500, null=True, blank=True, help_text="Physical location or video call link")
    notes = models.TextField(null=True, blank=True)

    # --- Attendees ---
    attendees = models.ManyToManyField(
        Contact, 
        related_name="appointments_attending", 
        blank=True
    )
    

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"'{self.title}' on {self.date} by {self.owner.username}"