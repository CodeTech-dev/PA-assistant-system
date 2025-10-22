import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import '../styles/calendar.css';
import { getAccessToken } from '../users/UserAuth';

import { fetchWithAuth } from '../users/UserAuth';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8000/api/tasks/';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [currentTitle, setCurrentTitle] = useState('');
    const calendarRef = useRef(null); 

    const { user } = useAuth()

    const transformTasksToEvents = (tasks) => {
        return tasks.map(task => {
            let eventColor = '#28a745';
            if (task.priority === 'High') eventColor = '#e57373';
            else if (task.priority === 'Medium') eventColor = '#ffb74d';

            let startDateTime = task.date;
            if (task.time) {
                const timePart = task.time.length === 5 ? task.time + ':00' : task.time;
                startDateTime = `${task.date}T${timePart}`;
            }

            return {
                id: task.id.toString(),
                title: task.description,
                start: startDateTime,
                allDay: !task.time,
                backgroundColor: eventColor,
                borderColor: eventColor,
            };
        });
    };

    // --- Fetching Task Data (Unchanged) ---
    useEffect(() => {
        const fetchTasksAndConvertToEvents = async () => {
            try {
                const token = getAccessToken();
                if (!token) { setError("Not authenticated. Please log in."); return; }
                const response = await fetchWithAuth(API_BASE_URL, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Could not fetch tasks for calendar.');
                const tasks = await response.json();
                const calendarEvents = transformTasksToEvents(tasks);
                setEvents(calendarEvents);
            } catch (err) {
                setError(err.message);
            }
        };
        if (user){
        fetchTasksAndConvertToEvents();
        }
    }, [user]);

    // --- NEW: Header Control Functions ---
    const goToNext = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.next();
    };

    const goToPrev = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.prev();
    };

    const goToToday = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.today();
    };

    const changeView = (viewName) => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(viewName);
    };

    // --- NEW: Update Title When View Changes ---
    const handleDatesSet = (dateInfo) => {
        // This function runs whenever the calendar navigates or changes view
        setCurrentTitle(dateInfo.view.title); // Update the title state
    };

    return (
        <div className="calendar-container">
            {error && <div className="error-message">{error}</div>}

            {/* --- NEW: Custom Header --- */}
            <div className="calendar-header">
                <div className="header-left">
                    <button onClick={goToToday} className="cal-button">Today</button>
                    <button onClick={goToPrev} className="cal-button nav-button">&lt;</button>
                    <button onClick={goToNext} className="cal-button nav-button">&gt;</button>
                </div>
                <div className="header-center">
                    <h2>{currentTitle}</h2>
                </div>
                <div className="header-right">
                    <button onClick={() => changeView('dayGridMonth')} className="cal-button view-button">Month</button>
                    <button onClick={() => changeView('dayGridWeek')} className="cal-button view-button">Week</button>
                    {/* Add dayGridDay view if needed */}
                    {/* <button onClick={() => changeView('dayGridDay')} className="cal-button view-button">Day</button> */}
                </div>
            </div>
            {/* --- End Custom Header --- */}

            <FullCalendar
                ref={calendarRef} // Assign the ref
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                weekends={true}
                events={events}
                height="100%"
                headerToolbar={false} // Disable the default header
                datesSet={handleDatesSet} // Call function when dates change
                // We will add dateClick and eventClick handlers later
            />
        </div>
    );
};

export default Calendar;