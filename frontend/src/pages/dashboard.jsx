import React from "react";
import '../styles/dashboard.css'

import QuickInfo from "../components/Quickinfo";

const Dashboard = () => {
    return(
        <div className="dashboard">
            <div className="greeting">
                <h1>Welcome <span>Alex</span></h1>
            </div>

            {/* Quick Actions */}
            <div class="quick-actions">
                {/* <div class="action-card">
                <i class="fas fa-plus-circle"></i>
                <h4>Add Appointment</h4>
                <p>Create new schedule</p>
                </div> */}
                <div class="action-card">
                <i class="fas fa-calendar-plus"></i>
                <h4>New Task</h4>
                <p>Add to-do items</p>
                </div>
                <div class="action-card">
                <i class="fas fa-user-plus"></i>
                <h4>Add Contact</h4>
                <p>Save new contact</p>
                </div>
                <div class="action-card">
                <i class="fas fa-bell"></i>
                <h4>Send Reminder</h4>
                <p>Email notification</p>
                </div>
            </div>    

            <div className="quick-info">
                    <QuickInfo />
            </div>
    </div>
    );
};

export default Dashboard; 