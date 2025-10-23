import React, { useState, useEffect } from 'react';
import ContactsView from '../components/ContactsView'; // The UI component
import ContactModal from '../components/ContactModal'; // The Modal component
import '../styles/contacts.css';
import { getAccessToken, fetchWithAuth } from '../users/UserAuth';
import { useAuth } from '../context/AuthContext';

const API_CONTACTS_URL = 'http://localhost:8000/api/contacts/';

const ContactsContainer = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null); // Contact object or null

    // Fetch contacts
    useEffect(() => {
        const fetchContacts = async () => {
            if (!user) {
                setContacts([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await fetchWithAuth(API_CONTACTS_URL);
                if (!response.ok) throw new Error('Could not fetch contacts.');
                const data = await response.json();
                setContacts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, [user]); // Re-fetch if user changes

    // --- Modal Control ---
    const handleAddContactClick = () => {
        setEditingContact(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingContact(null);
    };

    // --- CRUD Operations ---
    const handleSaveContact = async (formData) => {
        const url = editingContact
            ? `${API_CONTACTS_URL}${editingContact.id}/`
            : API_CONTACTS_URL;
        const method = editingContact ? 'PATCH' : 'POST';

        // Basic payload preparation
        const payload = {
            name: formData.name,
            email: formData.email || null, // Send null if empty
            phone: formData.phone || null,
            company: formData.company || null,
            title: formData.title || null,
        };

        try {
            const response = await fetchWithAuth(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(`Failed to ${method === 'POST' ? 'save' : 'update'} contact.`);

            const savedContact = await response.json();

            if (editingContact) {
                // Update: Replace the old contact with the updated one
                setContacts(prev => prev.map(c => c.id === savedContact.id ? savedContact : c));
            } else {
                // Add: Add the new contact to the list
                setContacts(prev => [savedContact, ...prev].sort((a,b) => a.name.localeCompare(b.name))); // Add and sort
            }
            handleCloseModal(); // Close modal on success
        } catch (err) {
            setError(err.message);
            // Keep modal open on error? Or show error in modal?
        }
    };

     const handleDeleteContact = async (contactId) => {
        // Simple confirmation
        if (!window.confirm("Are you sure you want to delete this contact?")) return;

        const originalContacts = [...contacts];
        // Optimistic UI update
        setContacts(prev => prev.filter(c => c.id !== contactId));

        try {
            const response = await fetchWithAuth(`${API_CONTACTS_URL}${contactId}/`, { method: 'DELETE' });
             if (response.status !== 204 && !response.ok) throw new Error('Failed to delete contact.');
             // Success: UI already updated
        } catch (err) {
            setError(err.message);
            setContacts(originalContacts); // Rollback on error
        }
    };

    return (
        <>
            <ContactsView
                contacts={contacts}
                loading={loading}
                error={error}
                onAddContact={handleAddContactClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteContact}
            />
            <ContactModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveContact}
                initialData={editingContact}
            />
        </>
    );
};

export default ContactsContainer;