from django.contrib import admin
from .models import Task 


# Register your models here.
class TaskAdmin(admin.ModelAdmin):
    list_display = ('description', 'owner', 'priority', 'created_at')

    list_filter = ('priority', 'owner')

    search_fields = ('description', 'owner__username')
admin.site.register(Task, TaskAdmin)