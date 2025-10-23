import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import '../styles/calendar.css'; // Make sure this path is correct

// Assuming these are correctly imported from your context/auth files
import { fetchWithAuth } from '../users/UserAuth'; // Assuming you have this wrapper
import { useAuth } from '../context/AuthContext'; // Assuming you use this context

const API_BASE_URL = 'http://localhost:8000/api/tasks/';

const DayPopover = ({ tasks, position, date, onClose }) => {
    // Helper to format time (can reuse from main component or redefine)
    const formatTime = (timeString) => {
        if (!timeString) return '';
        // Handles both HH:MM and HH:MM:SS
        const parts = timeString.split(':');
        const hour = parts[0];
        const minute = parts[1];
        const hourInt = parseInt(hour, 10);
        const ampm = hourInt >= 12 ? 'PM' : 'AM';
        let hour12 = hourInt % 12;
        if (hour12 === 0) hour12 = 12; // Handle midnight/noon
        return `${hour12}:${minute} ${ampm}`;
     };
    // Format date nicely for display
    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        // Ensure correct parsing regardless of timezone by adding time component
        const date = new Date(dateString + 'T00:00:00'); 
        return date.toDateString(); // e.g., "Tue Oct 21 2025"
    };

    const displayDate = formatDate(date);

    return (
        <div
            className="day-popover"
            // Position the popover using inline styles
            style={{ top: `${position.y + 5}px`, left: `${position.x + 5}px` }}
        >
            <div className="popover-header">
                <strong>{displayDate}</strong>
                <button onClick={onClose} className="close-btn">&times;</button>
            </div>
            <ul className="popover-task-list">
                {tasks.map(task => (
                    <li key={task.id} className="popover-task-item">
                        {/* Access priority and time via extendedProps */}
                        <span className={`popover-priority-dot priority-${task.extendedProps?.priority?.toLowerCase() || 'medium'}`}></span>
                        <span className="popover-task-time">{task.allDay ? 'All Day' : formatTime(task.extendedProps?.rawTime)}</span>
                        <span className="popover-task-title">{task.title}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// --- Main Calendar Component ---
const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [currentTitle, setCurrentTitle] = useState('');
    const calendarRef = useRef(null);

    // Popover State
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
    const [popoverDate, setPopoverDate] = useState(null);
    const [popoverTasks, setPopoverTasks] = useState([]);

    const { user } = useAuth(); // Get user from context

    const transformTasksToEvents = (tasks) => {
        return tasks.map(task => {
            let eventColor = '#28a745'; // Default blue
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
                extendedProps: { 
                    priority: task.priority,
                    rawTime: task.time 
                 }
            };
        });
    };

    useEffect(() => {
        const fetchTasksAndConvertToEvents = async () => {
            // Clear previous errors/events on new fetch
            setError(null);
            setEvents([]); 
            try {
                // No need for getAccessToken if fetchWithAuth handles it
                // const token = getAccessToken(); 
                // if (!token) { setError("Not authenticated. Please log in."); return; }

                // Use fetchWithAuth if it correctly adds the Authorization header
                const response = await fetchWithAuth(API_BASE_URL); // Simplified call

                if (!response.ok) {
                     // Try to get error details from response if available
                     let errorData;
                     try { errorData = await response.json(); } catch(e) {}
                     console.error("Fetch error response:", response.status, errorData);
                     throw new Error(`Could not fetch tasks (Status: ${response.status})`);
                }

                const tasks = await response.json();
                const calendarEvents = transformTasksToEvents(tasks);
                setEvents(calendarEvents);
            } catch (err) {
                console.error("Error fetching tasks:", err); // Log the actual error
                setError(err.message || "An unknown error occurred while fetching tasks.");
            }
        };
        // Only fetch if the user context is loaded
        if (user){ 
            fetchTasksAndConvertToEvents();
        } else {
             setError("Please log in to view tasks."); // Set error if user is not logged in
             setEvents([]); // Ensure events are cleared if user logs out
        }
    }, [user]); // Re-fetch when user changes (login/logout)


    const goToNext = () => {
        calendarRef.current?.getApi().next();
    };
    const goToPrev = () => {
        calendarRef.current?.getApi().prev();
    };
    const goToToday = () => {
        calendarRef.current?.getApi().today();
    };
    const changeView = (viewName) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
             calendarApi.changeView(viewName);
             setCurrentTitle(calendarApi.view.title);
        }
    };
    const handleDatesSet = (dateInfo) => {
        setCurrentTitle(dateInfo.view.title);
    };

    const handleDateClick = (arg) => {
        const clickedDateStr = arg.dateStr;
        const tasksForDay = events.filter(event =>
            event.start && event.start.startsWith(clickedDateStr)
        );

        if (tasksForDay.length > 0) {
            setPopoverTasks(tasksForDay);
            setPopoverDate(clickedDateStr);
            setPopoverPosition({ x: arg.jsEvent.pageX, y: arg.jsEvent.pageY });
            setPopoverVisible(true);
        } else {
            setPopoverVisible(false);
            console.log("Date clicked (no tasks):", clickedDateStr);
            // TODO: Add logic here to open "Add Task" modal
        }
    };

    const handleEventClick = (clickInfo) => {
        console.log("Event clicked:", clickInfo.event.title);
        console.log("Event details:", clickInfo.event);
        setPopoverVisible(false); // Close popover if open
        // TODO: Add logic here to open "Task Details" modal
    };

    const closePopover = () => {
        setPopoverVisible(false);
    };


    const renderEventContent = (eventInfo) => {
        const priority = eventInfo.event.extendedProps?.priority?.toLowerCase() || 'medium'; 
        return (
            <div className="fc-event-main-custom"> 
                <span className={`fc-event-priority-dot priority-${priority}`}></span>
                <span className="fc-event-title-custom">{eventInfo.event.title}</span>
            </div>
        );
    };

    return (
        <div className="calendar-container">
            {error && <div className="error-message">{error}</div>}

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
                    {/* <button onClick={() => changeView('dayGridDay')} className="cal-button view-button">Day</button> */}
                </div>
            </div>

            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                weekends={true}
                events={events}
                height="100%"
                headerToolbar={false}
                datesSet={handleDatesSet}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
            />

            {popoverVisible && (
                <DayPopover
                    tasks={popoverTasks}
                    position={popoverPosition}
                    date={popoverDate}
                    onClose={closePopover}
                />
            )}
        </div>
    );
};

export default Calendar;