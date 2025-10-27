from django.contrib import admin
from .models import Appointment


class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'date', 'time', 'location')
    list_filter = ('owner', 'date')
    search_fields = ('title', 'owner__username', 'location', 'notes')

# Register your model with the admin site
admin.site.register(Appointment, AppointmentAdmin)