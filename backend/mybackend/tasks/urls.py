from django.urls import path
from .views import TaskListCreate, TaskRetrieveUpdateDestroy

urlpatterns = [
    path('', TaskListCreate.as_view(), name='task-list-create'),
    # This path will handle GET, PUT, PATCH, and DELETE for a single task.
    path('<int:pk>/', TaskRetrieveUpdateDestroy.as_view(), name='task-detail'),
]