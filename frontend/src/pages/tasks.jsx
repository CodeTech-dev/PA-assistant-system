import React, { useState, useEffect } from 'react';
import TasksView from '../components/TaskView';
import '../styles/tasks.css';
import { getAccessToken } from '../users/UserAuth'; 

const API_BASE_URL = 'http://localhost:8000/api/tasks/';
const TasksContainer = () => {
    const [tasks, setTasks] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState(null);

    // --- NEW STATE FOR EDITING ---
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTaskData, setEditingTaskData] = useState({ description: '', date: '', time: '', priority: 'Medium' });

    // State for the input form
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');

    // --- Fetching Data on Load ---
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Use the imported getAccessToken function
                const token = getAccessToken(); 
                if (!token) {
                    setError("Not authenticated. Please log in.");
                    return;
                }

                const response = await fetch(`${API_BASE_URL}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Use Bearer for JWT
                    },
                });

                if (!response.ok) {
                    throw new Error('Could not fetch tasks.');
                }

                const data = await response.json();
                setTasks(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTasks();
    }, []);


    // --- Optimistic Update Function ---
    const handleAddTask = async () => {
        if (newTaskDescription.trim() === '') return;

        const tempId = `temp-${Date.now()}`;
        const newTask = {
            id: tempId,
            description: newTaskDescription,
            date: newTaskDate ? new Date(newTaskDate).toDateString().slice(0, 10) : 'No date',
            time: newTaskTime,
            priority: newTaskPriority,
            isSaving: true,
        };

        setTasks(prevTasks => [newTask, ...prevTasks]);

        setIsAdding(false);
        setNewTaskDescription('');
        setNewTaskDate('');
        setNewTaskTime('');
        setNewTaskPriority('Medium');

        try {
            const token = getAccessToken();
            const payload = {
                description: newTask.description,
                date: newTaskDate || null,
                time: newTaskTime || null,
                priority: newTask.priority,
            };

            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to save task to the server.');
            }

            const savedTask = await response.json();

            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === tempId ? { ...savedTask, isSaving: false } : task
                )
            );

        } catch (err) {
            setError('Failed to save. Please try again.');
            setTasks(prevTasks => prevTasks.filter(task => task.id !== tempId));
        }
    };

    // --- EDITING FUNCTIONS ---
    // Sets the component into editing mode for a specific task
    const handleEditStart = (task) => {
        setEditingTaskId(task.id);
        // Pre-fill the edit form with the task's current data
        setEditingTaskData({
            description: task.description,
            date: task.date, 
            time: task.time,
            priority: task.priority
        });
    };
    

    // Resets the editing state when an edit is canceled
    const handleEditCancel = () => {
        setEditingTaskId(null);
    };

    // Saves the updated task data
    const handleEditSave = async (taskId) => {
        const originalTasks = [...tasks];
        
        // Optimistically update the UI to show the change immediately
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, ...editingTaskData } : task
            )
        );
        setEditingTaskId(null); // Exit editing mode

        // Send the updated data to the backend
        try {
            const token = getAccessToken();
            // Use PATCH for partial updates, sending only the changed data
            const response = await fetch(`${API_BASE_URL}${taskId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(editingTaskData)
            });

            if (!response.ok) {
                throw new Error('Failed to update task on the server.');
            }
            
            // Optionally, update the task with the final data from the server
            const updatedTaskFromServer = await response.json();
            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === taskId ? updatedTaskFromServer : task
                )
            );

        } catch (err) {
            setError(err.message);
            setTasks(originalTasks); // Rollback on error
        }
    };

    // --- NEW DELETE FUNCTION ---
    const handleDeleteTask = async (taskId) => {
        const originalTasks = [...tasks];
        
        // Optimistically update the UI
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

        // Send delete request to the backend
        try {
            const token = getAccessToken();
            const response = await fetch(`${API_BASE_URL}${taskId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                // response.status === 204 No Content is also a success
                if (response.status !== 204) {
                    throw new Error('Failed to delete the task from the server.');
                }
            }
            // On success, do nothing, UI is already updated.
        } catch (err) {
            // If it fails, roll back the UI change
            setError(err.message);
            setTasks(originalTasks);
        }
    };

    
    // --- Render ---
    return (
        <TasksView
            tasks={tasks}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            newTaskDescription={newTaskDescription}
            setNewTaskDescription={setNewTaskDescription}
            newTaskDate={newTaskDate}
            setNewTaskDate={setNewTaskDate}
            newTaskTime={newTaskTime}
            setNewTaskTime={setNewTaskTime}
            newTaskPriority={newTaskPriority}
            setNewTaskPriority={setNewTaskPriority}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}

            editingTaskId={editingTaskId}
            editingTaskData={editingTaskData}
            setEditingTaskData={setEditingTaskData}
            onEditStart={handleEditStart}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            
            error={error}
        />
    );
};

export default TasksContainer;