from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/contacts/', include('contacts.urls')),
    path('api/appointments/', include('appointments.urls')),
]
