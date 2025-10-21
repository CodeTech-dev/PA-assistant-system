import React from 'react';

const TasksView = (props) => {
    // Helper to format time (moved here as it's a display concern)
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        const hourInt = parseInt(hour, 10);
        const ampm = hourInt >= 12 ? 'PM' : 'AM';
        let hour12 = hourInt % 12;
        if (hour12 === 0) hour12 = 12;
        return `${hour12}:${minute} ${ampm}`;
    };

    return (
        <div className="task-app">
            {/* Display API errors at the top */}
            {props.error && <div className="error-message">{props.error}</div>}

            <div className="task-header">
                <h2>Tasks</h2>
                <div className="task-app-action">
                    <button 
                        className="addTask" 
                        onClick={() => props.setIsAdding(true)}
                        disabled={props.isAdding}
                    >
                        <i className="fa fa-plus"></i>
                        Add Task
                    </button>
                    <button className="addTask filterBtn">
                        Filter
                        <i className="fa fa-filter"></i>
                    </button>
                </div>
            </div>

            <div className="task-list-container">
                <ul className="task-list">
                    
                    {props.isAdding && (
                        <li className="task-item add-task-form">
                            <div className="task-item-name">
                                <input 
                                    type="text" 
                                    placeholder="Enter task description..." 
                                    className="task-text-input" 
                                    value={props.newTaskDescription}
                                    onChange={(e) => props.setNewTaskDescription(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="task-meta">
                                <span className="task-date">
                                    <select 
                                        value={props.newTaskPriority} 
                                        onChange={(e) => props.setNewTaskPriority(e.target.value)}
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                    <input 
                                        type="date"
                                        value={props.newTaskDate}
                                        onChange={(e) => props.setNewTaskDate(e.target.value)}
                                    />
                                    <input 
                                        type="time"
                                        value={props.newTaskTime}
                                        onChange={(e) => props.setNewTaskTime(e.target.value)}
                                    />
                                </span>
                                <div className="task-list-actions">
                                    <button className="icon-btn save-btn" onClick={props.onAddTask}>
                                        <i className="fa fa-check"></i>
                                    </button>
                                    <button className="icon-btn" onClick={() => props.setIsAdding(false)}>
                                        <i className="fa fa-times"></i>
                                    </button>
                                </div>
                                <span className="priority-dot-placeholder"></span>
                            </div>
                        </li>
                    )}
                    
                    {props.tasks.map(task => (
                        // Add a 'saving' class if the task is being saved
                        <li key={task.id} className={`task-item ${task.isSaving ? 'saving' : ''}`}>
                            <div className="task-item-name">
                                <span className="task-text">{task.description}</span>
                            </div>
                            <div className="task-meta">
                                <span className="task-date">
                                    <i className="fa fa-clock-o"></i>
                                    {task.date} {task.time && `| ${formatTime(task.time)}`}
                                </span>
                                <div className="task-list-actions">
                                    <button className="icon-btn">
                                        <i className="fa fa-pencil"></i>
                                    </button>
                                    <button className="icon-btn">
                                        <i className="fa fa-trash"
                                        onClick={() => props.onDeleteTask(task.id)}></i>
                                    </button>
                                </div>
                                <span className={`priority-dot priority-${task.priority.toLowerCase()}`}></span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TasksView;