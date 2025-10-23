import React, { useState, useEffect, useMemo } from 'react';
import '../styles/Quickinfo.css'; // Make sure path is correct
// Adjust path for auth helpers as needed
import { getAccessToken, fetchWithAuth } from '../users/UserAuth'; 
import { useAuth } from '../context/AuthContext'; 

const API_TASKS_URL = 'http://localhost:8000/api/tasks/';
const API_CONTACTS_URL = 'http://localhost:8000/api/contacts/';

const QuickInfo = () => {
    // --- State for Tasks ---
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [tasksError, setTasksError] = useState(null);

    // --- State for Contacts ---
    const [keyContacts, setKeyContacts] = useState([]);
    const [contactsLoading, setContactsLoading] = useState(true);
    const [contactsError, setContactsError] = useState(null);

    const { user } = useAuth();

    // --- Fetch and Process Tasks Effect ---
    useEffect(() => {
        const fetchAndProcessTasks = async () => {
            if (!user) {
                setUpcomingTasks([]);
                setTasksLoading(false);
                return;
            }
            setTasksLoading(true);
            setTasksError(null);
            try {
                const response = await fetchWithAuth(API_TASKS_URL);
                if (!response.ok) throw new Error('Could not fetch tasks.');
                const allTasks = await response.json();
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const processedTasks = allTasks
                    .filter(task => !task.completed)
                    .filter(task => task.date && new Date(task.date + 'T00:00:00') >= today)
                    .sort((a, b) => {
                         const dateA = new Date(a.date);
                         const dateB = new Date(b.date);
                         if (dateA < dateB) return -1;
                         if (dateA > dateB) return 1;
                         const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                         return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
                     })
                    .slice(0, 3);
                setUpcomingTasks(processedTasks);
            } catch (err) {
                console.error("Error fetching quick info tasks:", err);
                setTasksError(err.message);
            } finally {
                setTasksLoading(false);
            }
        };
        fetchAndProcessTasks();
    }, [user]);

    // --- Fetch and Process Contacts Effect ---
    useEffect(() => {
        const fetchAndProcessContacts = async () => {
             if (!user) {
                 setKeyContacts([]);
                 setContactsLoading(false);
                 return;
             }
             setContactsLoading(true);
             setContactsError(null);
             try {
                 const response = await fetchWithAuth(API_CONTACTS_URL);
                 if (!response.ok) throw new Error('Could not fetch contacts.');
                 const allContacts = await response.json();
                 const processedContacts = allContacts.slice(0, 3); // Simple slice for now
                 setKeyContacts(processedContacts);
             } catch (err) {
                 console.error("Error fetching quick info contacts:", err);
                 setContactsError(err.message);
             } finally {
                 setContactsLoading(false);
             }
         };
         fetchAndProcessContacts();
    }, [user]);

    // --- Helpers ---
    const getPriorityClass = (priority) => `priority-${priority?.toLowerCase() || 'medium'}`;

    // --- RESTORED: Helper to format date nicely ---
    const formatDateDisplay = (dateString) => {
         if (!dateString) return '';
         const today = new Date(); today.setHours(0,0,0,0);
         const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
         // Ensure date string is parsed correctly (treat as UTC to avoid timezone shifts)
         const taskDate = new Date(dateString + 'T00:00:00'); 

         if (taskDate.getTime() === today.getTime()) return 'Due Today';
         if (taskDate.getTime() === tomorrow.getTime()) return 'Due Tomorrow';
         
         // Format as "MMM DD" e.g., "Oct 25"
         return `Due ${taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
        return (names[0][0]?.toUpperCase() || '') + (names[names.length - 1][0]?.toUpperCase() || '');
    };

    return (
        <div className="info-glance">
            {/* Upcoming Tasks Card */}
            <div className="card">
                <div className="card-header">
                    <h3>Upcoming Tasks</h3>
                    <a href="/tasks">View all tasks →</a>
                </div>
                {tasksLoading && <li className="task-item loading">Loading tasks...</li>}
                {tasksError && <p className="error-text">{tasksError}</p>}
                <ul className="task-list">
                    {!tasksLoading && !tasksError && (
                        upcomingTasks.length > 0 ? (
                            upcomingTasks.map(task => (
                                <li key={task.id} className={'task-item'}>
                                    <div className="task-info"><span>{task.description}</span></div>
                                    <div className="task-meta">
                                        <span className={`priority-dot ${getPriorityClass(task.priority)}`}></span>
                                        {/* --- RESTORED: Use formatted date --- */}
                                        <span className="due-date">{formatDateDisplay(task.date)}</span>
                                    </div>
                                </li>
                            ))
                        ) : ( <li className="task-item no-tasks">No upcoming tasks.</li> )
                    )}
                </ul>
            </div>

            {/* Key Contacts Card */}
            <div className="card">
                <div className="card-header">
                    <h3>Key Contacts</h3>
                    <a href="/contacts">View all contacts →</a>
                </div>
                {contactsLoading && <li className="contact-item loading">Loading contacts...</li>}
                {contactsError && <p className="error-text">{contactsError}</p>}
                <ul className="contact-list">
                     {!contactsLoading && !contactsError && (
                        keyContacts.length > 0 ? (
                            keyContacts.map(contact => (
                                <li key={contact.id} className="contact-item">
                                    <div className="contact-avatar">{getInitials(contact.name)}</div>
                                    <div className="contact-details">
                                        <p className="contact-name">{contact.name}</p>
                                        <p className="contact-title">{contact.title}{contact.company && `, ${contact.company}`}</p>
                                    </div>
                                    <div className="contact-actions">
                                        {contact.email && <a href={`mailto:${contact.email}`} title="Send Email">📧</a>}
                                        {contact.phone && <a href={`tel:${contact.phone}`} title="Call">📞</a>}
                                    </div>
                                </li>
                            ))
                        ) : ( <li className="contact-item no-contacts">No key contacts found.</li> )
                     )}
                </ul>
            </div>
        </div>
    );
};

export default QuickInfo;