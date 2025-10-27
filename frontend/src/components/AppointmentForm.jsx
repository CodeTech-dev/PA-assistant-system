import React, { useState, useEffect } from 'react';
import '../styles/appointmentForm.css';

const AppointmentForm = ({ 
    selectedDate, 
    editingEvent, 
    onSaveAppointment, 
    onDeleteAppointment,
    setEditingEvent,
    setSelectedDate
    }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('09:00'); // Default time
    const [location, setLocation] = useState('');
    const [attendees, setAttendees] = useState(''); 
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (editingEvent) {
            // --- EDITING MODE ---
            // Populate the form with the event's data
            setTitle(editingEvent.title);
            setDate(editingEvent.start.split('T')[0]); // "2025-10-20T09:00:00" -> "2025-10-20"
            setTime(editingEvent.extendedProps.rawTime || '09:00');
            setLocation(editingEvent.extendedProps.location || '');
            setNotes(editingEvent.extendedProps.notes || '');
        } else if (selectedDate) {
            // --- NEW APPOINTMENT MODE ---
            // Clear form and set the new date
            setTitle('');
            setDate(selectedDate);
            setTime('09:00');
            setLocation('');
            setNotes('');
        } else {
            // --- CLEARED/DEFAULT STATE ---
            setTitle('');
            setDate('');
            setTime('09:00');
            setLocation('');
            setNotes('');
        }
    }, [editingEvent, selectedDate]);

    const handleSubmit = (e) => {
        e.preventDefault(); 
        if (!title || !date) {
            alert('Please fill in at least a title and date.');
            return;
        }

        const appointmentData = {
            title: title,
            date: date,
            time: time,
            location: location,
            notes: notes
        };

        // Call the parent function, passing the ID if we are editing
        onSaveAppointment(appointmentData, editingEvent ? editingEvent.id : null);
    };

    const handleDelete = () => {
        if (editingEvent) {
            onDeleteAppointment(editingEvent.id);
        }
    };

    const handleCancel = () => {
        setEditingEvent(null);
        setSelectedDate(null);
    };

    return (
        <div className="new-appointment-container">
            <h3>{editingEvent ? 'Edit Appointment' : 'New Appointment'}</h3>
            <form onSubmit={handleSubmit} className="appointment-form">
                
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Quarterly Review"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="time">Time</label>
                        <input
                            type="time"
                            id="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location / Video Link</label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Add location or link"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="attendees">Attendees</label>
                    <input
                        type="text"
                        id="attendees"
                        value={attendees}
                        onChange={(e) => setAttendees(e.target.value)}
                        placeholder="Add by name or email"
                    />
                </div>

                {/* <div className="form-group">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                        id="notes"
                        rows="4"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add agenda, notes, or attachments..."
                    ></textarea>
                </div> */}

                <div className="form-buttons">
                    {editingEvent && (
                        <button
                            type="button"
                            className="btn btn-delete"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    )}
                    <button 
                        type="button" 
                        className="btn btn-cancel"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-save">
                        {editingEvent ? 'Save Changes' : 'Save & Send Invite'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AppointmentForm;