from rest_framework import generics, permissions
from .models import Contact
from .serializers import ContactSerializer

class ContactListCreate(generics.ListCreateAPIView):
    """ List all contacts for the logged-in user or create a new one. """
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by owner
        return Contact.objects.filter(owner=self.request.user).order_by('name')

    def perform_create(self, serializer):
        # Assign owner automatically
        serializer.save(owner=self.request.user)

class ContactRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    """ Retrieve, update or delete a specific contact instance. """
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Ensure user can only access their own contacts
        return Contact.objects.filter(owner=self.request.user)