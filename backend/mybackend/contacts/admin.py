from django.contrib import admin
from .models import Contact

class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'company', 'owner')
    list_filter = ('owner', 'company')
    search_fields = ('name', 'email', 'company', 'owner__username')

admin.site.register(Contact, ContactAdmin)