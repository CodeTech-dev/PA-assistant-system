from rest_framework import generics, permissions
from .models import Task
from .serializers import TaskSerializer

class TaskListCreate(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    # This view is only accessible to authenticated users
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # This is the magic! Filter tasks by the logged-in user.
        return Task.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # This is the other magic! Automatically set the owner when creating.
        serializer.save(owner=self.request.user)
    

    # This view is for retrieving, updating, or deleting a single, specific task
class TaskRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # This ensures a user can only access and delete THEIR OWN tasks.
        return Task.objects.filter(owner=self.request.user)