import React, { useState } from 'react';
import '../styles/Quickinfo.css'


const QuickInfo = () => {
  // Sample data - in a real app, this would come from an API
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Finalize Q4 Budget Report', priority: 'High', due: 'Due in 2 days', completed: false },
    { id: 2, text: 'Follow up with Innovate Corp.', priority: 'Medium', due: 'Due: Oct 13, 2025', completed: false },
    { id: 3, text: 'Draft weekly team newsletter', priority: 'Low', due: 'Due: Oct 15, 2025', completed: true },
  ]);

  const [contacts] = useState([
    { id: 1, initials: 'JD', name: 'John Doe', title: 'Marketing Lead, Acme Inc.' },
    { id: 2, initials: 'AS', name: 'Aisha Sani', title: 'Project Manager, Tech Solutions' },
    { id: 3, initials: 'CE', name: 'Chidi Eze', title: 'CEO, Innovate Nigeria' },
  ]);

  // Handler to toggle task completion
  const handleTaskToggle = (id) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Helper to get the CSS class for priority
  const getPriorityClass = (priority) => {
    return `priority-${priority.toLowerCase()}`;
  };

  return (
    <div className="info-glance">
      {/* Upcoming Tasks Card */}
      <div className="card">
        <div className="card-header">
          <h3>Upcoming Tasks</h3>
          <a href="/tasks">View all tasks →</a>
        </div>
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className={task.completed ? 'task-item completed' : 'task-item'}>
              <div className="task-info">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleTaskToggle(task.id)}
                />
                <span>{task.text}</span>
              </div>
              <div className="task-meta">
                <span className={`priority-dot ${getPriorityClass(task.priority)}`}></span>
                <span className="due-date">{task.due}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Contacts Card */}
      <div className="card">
        <div className="card-header">
          <h3>Key Contacts</h3>
          <a href="/contacts">View all contacts →</a>
        </div>
        <ul className="contact-list">
          {contacts.map(contact => (
            <li key={contact.id} className="contact-item">
              <div className="contact-avatar">{contact.initials}</div>
              <div className="contact-details">
                <p className="contact-name">{contact.name}</p>
                <p className="contact-title">{contact.title}</p>
              </div>
              <div className="contact-actions">
                <a href={`mailto:${contact.name.replace(' ', '.').toLowerCase()}@example.com`} title="Send Email">📧</a>
                <a href="tel:+234000000000" title="Call">📞</a>
                {/* Example with react-icons: */}
                {/* <a href="#" title="Send Email"><FiMail /></a> */}
                {/* <a href="#" title="Call"><FiPhone /></a> */}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QuickInfo;