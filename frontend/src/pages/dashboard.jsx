import React from "react"; // Removed useState, useEffect, useRef for notifications
import '../styles/dashboard.css'
// Make sure this path is correct for your notification styles
import '../styles/notification.css' 
import QuickInfo from "../components/Quickinfo";
import { useAuth } from "../context/AuthContext";
import DashboardStats from "../components/dashboardStats";

const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
        return 'Good morning';
    } else if (currentHour < 18) {
        return 'Good afternoon';
    } else {
        return 'Good evening';
    }
};

const Dashboard = () => {
    const { user, logout } = useAuth()
    
    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="greeting">
                    <h1> {getGreeting()}{' '}
                        <span className="user-name">{user ? user.full_name : 'User'}
                        </span>
                    </h1>
                </div>

                <div className="header-actions"> 
                    <button onClick={logout} className="logout-button">
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
    

            <div className="quick-actions">
                <DashboardStats />
                {/* <div className="action-card"> 
                    <i className="fas fa-calendar-plus"></i>
                    <h4>New Task</h4>
                    <p>Add to-do items</p>
                </div>
                <div className="action-card">
                    <i className="fas fa-user-plus"></i> 
                    <h4>Add Contact</h4>
                    <p>Save new contact</p>
                </div>
                <div className="action-card">
                    <i className="fas fa-bell"></i>
                    <h4>Send Reminder</h4>
                    <p>Email notification</p>
                </div> */}
            </div>    

            <div className="quick-info">
                <QuickInfo />
            </div>
        </div>
    );
};

export default Dashboard;