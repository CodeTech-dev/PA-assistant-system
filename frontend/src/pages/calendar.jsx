import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import '../styles/calendar.css'; // Make sure this path is correct

// --- Main Calendar Component ---
// 1. Now accepts props from the parent (AppointmentsPage)
const Calendar = ({ events, onDateSelect, onEventSelect }) => {
    
    // --- KEPT ---
    // This state is for the calendar's internal UI (the "October 2024" title)
    const [currentTitle, setCurrentTitle] = useState('');
    const calendarRef = useRef(null);

    // --- KEPT ---
    // All navigation functions are kept as they are local to this component.
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
        // 'arg.dateStr' is the date string like "2025-10-21"
        onDateSelect(arg.dateStr); 
    };


    const handleEventClick = (clickInfo) => {
        // 'clickInfo.event' is the FullCalendar event object
        onEventSelect(clickInfo.event);
    };


    // --- KEPT ---
    // This function for styling the event remains unchanged.
    const renderEventContent = (eventInfo) => {
        const eventColor = eventInfo.event.backgroundColor;
        return (
            <div className="fc-event-main-custom"
            style={{
                backgroundColor: eventColor,
                borderColor: eventColor,
                color: '#fff',
                padding: '2px 4px',
                width: '100%'
            }}
            > 
                <span className="fc-event-title-custom">{eventInfo.event.title}</span>
            </div>
        );
    };

    return (
        <div className="calendar-container">
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
                showNonCurrentDates={false}
                // height="75%"
                headerToolbar={false}
                datesSet={handleDatesSet}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
            />
        </div>
    );
};

export default Calendar;