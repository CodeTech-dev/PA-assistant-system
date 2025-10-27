import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../users/UserAuth';
import '../styles/dashboardStats.css';

// API endpoints
const TASKS_URL = 'http://localhost:8000/api/tasks/';
const APPOINTMENTS_URL = 'http://localhost:8000/api/appointments/';
const CONTACTS_URL = 'http://localhost:8000/api/contacts/'; 

// A small, reusable component for each card
const StatCard = ({ title, count, icon }) => {
    return (
        <div className="stat-card">
            <div className={`stat-card-icon ${icon}`}>
                <i className={`fa ${icon}`}></i>
            </div>
            <div className="stat-card-info">
                <span className="stat-card-count">{count}</span>
                <span className="stat-card-title">{title}</span>
            </div>
        </div>
    );
};

// The main component that fetches data
const DashboardStats = () => {
    const { user } = useAuth();
    const [taskCount, setTaskCount] = useState(0);
    const [appointmentCount, setAppointmentCount] = useState(0);
    const [contactCount, setContactCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) return; // Don't fetch if user is not logged in

        const fetchAllCounts = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // We use Promise.all to fetch all three endpoints at the same time
                const [taskRes, apptRes, contactRes] = await Promise.all([
                    fetchWithAuth(TASKS_URL),
                    fetchWithAuth(APPOINTMENTS_URL),
                    fetchWithAuth(CONTACTS_URL)
                ]);

                // Check all responses
                if (!taskRes.ok) throw new Error('Failed to fetch tasks');
                if (!apptRes.ok) throw new Error('Failed to fetch appointments');
                if (!contactRes.ok) throw new Error('Failed to fetch contacts');

                // Get the JSON data (which is an array)
                const tasks = await taskRes.json();
                const appointments = await apptRes.json();
                const contacts = await contactRes.json();

                // Set the counts based on the length of the arrays
                setTaskCount(tasks.length);
                setAppointmentCount(appointments.length);
                setContactCount(contacts.length);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllCounts();
    }, [user]); // Re-fetch if the user changes

    if (error) {
        return <div className="error-message">Could not load dashboard stats.</div>;
    }

    if (loading) {
        return <div>Loading stats...</div>; // You can make this a spinner
    }

    return (
        <div className="stat-cards-container">
            <StatCard 
                title="Total Tasks" 
                count={taskCount} 
                icon="fa-tasks" 
            />
            <StatCard 
                title="Appointments" 
                count={appointmentCount} 
                icon="fa-calendar" 
            />
            <StatCard 
                title="Total Contacts" 
                count={contactCount} 
                icon="fa-users" 
            />
        </div>
    );
};

export default DashboardStats;