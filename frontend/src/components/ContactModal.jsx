import React, { useState, useEffect } from 'react';
import '../styles/contacts.css'; 

const ContactModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', company: '', title: ''
    });

    // When initialData changes (meaning we opened the modal for editing), update the form
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                company: initialData.company || '',
                title: initialData.title || '',
            });
        } else {
            // Reset form when opening for "Add New"
             setFormData({ name: '', email: '', phone: '', company: '', title: '' });
        }
    }, [initialData, isOpen]); // Rerun effect if initialData or isOpen changes

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation: Ensure name is present
        if (!formData.name.trim()) {
            alert("Name is required."); // Replace with better validation later
            return;
        }
        onSave(formData); // Pass the current form data back to the container
    };

    if (!isOpen) return null; // Don't render anything if modal is closed

    return (
        <div className="modal-backdrop" onClick={onClose}> {/* Close on backdrop click */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside */}
                <h3>{initialData ? 'Edit Contact' : 'Add New Contact'}</h3>
                <form onSubmit={handleSubmit}>
                    {/* Add more robust form fields later */}
                    <div className="form-group">
                        <label>Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                     <div className="form-group">
                        <label>Phone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                     <div className="form-group">
                        <label>Company</label>
                        <input type="text" name="company" value={formData.company} onChange={handleChange} />
                    </div>
                     <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} />
                    </div>
                    {/* ... More fields if needed ... */}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn">Save Contact</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactModal;