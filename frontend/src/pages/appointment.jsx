import React, { useState, useEffect } from 'react';
import Calendar from './calendar'; // Your existing calendar component (will be modified in Step 3)
import AppointmentForm from '../components/AppointmentForm'; // The component from Step 1
import { fetchWithAuth } from '../users/UserAuth'; 
import { useAuth } from '../context/AuthContext'; 


import '../styles/appointment.css'; 
import '../styles/calendar.css'; 

// --- Logic Moved from Calendar.js ---
const API_BASE_URL = 'http://localhost:8000/api/appointments/';


const transformAppointmentsToEvents = (appointments) => {
    return appointments.map(appointment => {
        let eventColor = '#3788d8'; // Default FullCalendar blue
        let startDateTime = appointment.date;
        if (appointment.time) {
            const timePart = appointment.time.length === 5 ? appointment.time + ':00' : appointment.time;
            startDateTime = `${appointment.date}T${timePart}`;
        }

        return {
            id: appointment.id.toString(),
            title: appointment.title, // Changed from 'task.description'
            start: startDateTime,
            allDay: !appointment.time,
            backgroundColor: eventColor,
            borderColor: eventColor,
            extendedProps: { 
                // We'll store our new data here
                rawTime: appointment.time,
                location: appointment.location,
                notes: appointment.notes
            }
        };
    });
};
// --- End of Moved Logic ---


const AppointmentPage = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    
    // --- Data Fetching Logic Moved from Calendar.js ---
    useEffect(() => {
        const fetchTasksAndConvertToEvents = async () => {
            setError(null);
            setEvents([]); 
            try {
                const response = await fetchWithAuth(API_BASE_URL); 

                if (!response.ok) {
                    let errorData;
                    try { errorData = await response.json(); } catch(e) {}
                    console.error("Fetch error response:", response.status, errorData);
                    throw new Error(`Could not fetch tasks (Status: ${response.status})`);
                }

                const appointments = await response.json();
                const calendarEvents = transformAppointmentsToEvents(appointments);
                setEvents(calendarEvents);
            } catch (err) {
                console.error("Error fetching tasks:", err);
                setError(err.message || "An unknown error occurred while fetching tasks.");
            }
        };
        
        if (user){ 
            fetchTasksAndConvertToEvents();
        } else {
            setError("Please log in to view tasks.");
            setEvents([]);
        }
    }, [user]); // Re-fetch when user changes (login/logout)
    // --- End of Moved Data Fetching ---

    const handleDateSelect = (dateStr) => {
        console.log("Date selected in parent:", dateStr);
        setSelectedDate(dateStr);
        setEditingEvent(null);
    };

    const handleEventSelect = (eventInfo) => {
        console.log("Event selected in parent:", eventInfo);
        const fullEvent = events.find(e => e.id === eventInfo.id);
        setEditingEvent(fullEvent);
        setSelectedDate(null);
    };


    const handleSaveAppointment = async (appointmentData, eventId) => {
        try {
            let response;
            let updatedOrNewAppointment;

            if (eventId) {
                // --- UPDATE (PUT Request) ---
                console.log("Updating event:", eventId, appointmentData);
                response = await fetchWithAuth(`${API_BASE_URL}${eventId}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(appointmentData)
                });

                if (!response.ok) {
                    const errBody = await response.json();
                    console.error("API Update Error:", errBody);
                    throw new Error('Failed to update appointment');
                }
                
                updatedOrNewAppointment = await response.json();
                
                // Update the 'events' state by REPLACING the old event
                const newEvent = transformAppointmentsToEvents([updatedOrNewAppointment])[0];
                setEvents(events.map(e => e.id === eventId ? newEvent : e));

            } else {
                // --- CREATE (POST Request) ---
                console.log("Creating new event:", appointmentData);
                response = await fetchWithAuth(API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(appointmentData)
                });

                if (!response.ok) {
                    const errBody = await response.json();
                    console.error("API Create Error:", errBody);
                    throw new Error('Failed to create appointment');
                }
                
                updatedOrNewAppointment = await response.json();

                // Add the new event to the 'events' state
                const newEvent = transformAppointmentsToEvents([updatedOrNewAppointment])[0];
                setEvents(prevEvents => [...prevEvents, newEvent]);
            }
            setEditingEvent(null);
            setSelectedDate(null);

        } catch (err) {
            setError(err.message);
        }
    };


    const handleDeleteAppointment = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this appointment?")) {
            return;
        }

        try {
            // --- DELETE (DELETE Request) ---
            console.log("Deleting event:", eventId);
            // We send the request to the specific endpoint: /api/appointments/5/
            const response = await fetchWithAuth(`${API_BASE_URL}${eventId}/`, {
                method: 'DELETE',
            });

            if (!response.ok && response.status !== 204) { // 204 No Content is a success
                const errBody = await response.json();
                console.error("API Delete Error:", errBody);
                throw new Error('Failed to delete appointment');
            }
            
            // Update the 'events' state by FILTERING OUT the deleted event
            setEvents(events.filter(e => e.id !== eventId.toString()));
            setEditingEvent(null);
            setSelectedDate(null);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="appointments-page-layout">
            {/* Column 1: The Calendar */}
            <div className="calendar-column">
                {error && <div className="error-message">{error}</div>}
                <Calendar 
                    events={events}
                    onDateSelect={handleDateSelect}
                    onEventSelect={handleEventSelect}
                />
            </div>

            {/* Column 2: The Form */}
            <div className="form-column">
                <AppointmentForm 
                    selectedDate={selectedDate}
                    editingEvent={editingEvent}
                    onSaveAppointment={handleSaveAppointment}
                    onDeleteAppointment={handleDeleteAppointment}
                    setEditingEvent={setEditingEvent}
                    setSelectedDate={setSelectedDate}
                />
            </div>
        </div>
    );
};

export default AppointmentPage;