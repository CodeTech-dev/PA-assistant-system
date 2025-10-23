import React from 'react';
import '../styles/contacts.css'; 

const ContactsView = ({ contacts, loading, error, onAddContact, onEdit, onDelete }) => {

    // Simple initials helper
    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
        return (names[0][0]?.toUpperCase() || '') + (names[names.length - 1][0]?.toUpperCase() || '');
    };

    return (
        <div className="contact-app">
            {/* --- Header Area --- */}
            <div className="contact-header">
                <h2>Contacts</h2>
                <div className="contact-search-container">
                    <input type="text" placeholder="Search contacts..." className="contact-search-input" />
                    <i className="fa fa-search search-icon"></i> 
                </div>
                <div className="contact-app-action">
                    <button className="addContactBtn" onClick={onAddContact}>
                        <i className="fa fa-plus"></i>
                        Add Contact
                    </button>
                </div>
            </div>

            {/* --- Loading & Error Display --- */}
            {loading && <div className="loading-message">Loading contacts...</div>}
            {error && <div className="error-message">{error}</div>}

            {/* --- Contact List Area --- */}
            {!loading && !error && (
                <div className="contact-list-container">
                    <ul className="contact-list">
                        {/* --- FIX: Add check for contacts being an array --- */}
                        {Array.isArray(contacts) && contacts.length > 0 ? ( 
                            contacts.map(contact => ( 
                                <li key={contact.id} className="contact-item">
                                    {/* ... rest of the list item JSX ... */}
                                    <div className="contact-main-info">
                                        <div className="contact-avatar">{getInitials(contact.name)}</div>
                                        <div className="contact-details">
                                            <p className="contact-name">{contact.name}</p>
                                            <p className="contact-title-company">
                                                {contact.title}{contact.company && `, ${contact.company}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="contact-actions">
                                        {contact.email && (
                                            <a href={`mailto:${contact.email}`} className="icon-btn" title="Send Email">
                                                <i className="fa fa-envelope"></i>
                                            </a>
                                        )}
                                        {contact.phone && (
                                            <a href={`tel:${contact.phone}`} className="icon-btn" title="Call">
                                                <i className="fa fa-phone"></i>
                                            </a>
                                        )}
                                        <div className="contact-secondary-actions"> 
                                            <button className="icon-btn" title="Edit" onClick={() => onEdit(contact)}>
                                                <i className="fa fa-pencil"></i>
                                            </button>
                                            <button className="icon-btn" title="Delete" onClick={() => onDelete(contact.id)}>
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))
                        // Also check if contacts is an array before showing "no contacts"
                        ) : Array.isArray(contacts) ? ( 
                            <li className="contact-item no-contacts">You haven't added any contacts yet.</li>
                        ) : null /* Or show nothing if contacts is not an array yet */ } 
                    </ul>
                </div>
            )}
        </div>
    )
}

export default ContactsView;
