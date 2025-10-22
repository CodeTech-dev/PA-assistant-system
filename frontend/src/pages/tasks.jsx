import React, { useState, useEffect } from 'react';
import TasksView from '../components/TaskView';
import '../styles/tasks.css';
// Adjust this path to match your project's folder structure
import { getAccessToken } from '../users/UserAuth'; 

const API_BASE_URL = 'http://localhost:8000/api/tasks/';

const TasksContainer = () => {
    const [tasks, setTasks] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState(null);

    // State for editing a task
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTaskData, setEditingTaskData] = useState({ description: '', date: '', time: '', priority: 'Medium' });

    // State for the "Add New Task" form
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');

    // Fetching tasks on component load
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = getAccessToken(); 
                if (!token) {
                    setError("Not authenticated. Please log in.");
                    return;
                }
                const response = await fetch(API_BASE_URL, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error('Could not fetch tasks.');
                const data = await response.json();
                setTasks(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchTasks();
    }, []);

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
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Failed to save task to the server.');
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

    const handleDeleteTask = async (taskId) => {
        const originalTasks = [...tasks];
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        try {
            const token = getAccessToken();
            const response = await fetch(`${API_BASE_URL}${taskId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.status !== 204 && !response.ok) {
                throw new Error('Failed to delete the task from the server.');
            }
        } catch (err) {
            setError(err.message);
            setTasks(originalTasks);
        }
    };

    const handleEditStart = (task) => {
        setEditingTaskId(task.id);
        setEditingTaskData({
            description: task.description,
            date: task.date, 
            time: task.time ? task.time.slice(0, 5) : '',
            priority: task.priority
        });
    };

    const handleEditCancel = () => {
        setEditingTaskId(null);
    };

    const handleEditSave = async (taskId) => {
        const originalTasks = [...tasks];
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, ...editingTaskData, date: editingTaskData.date ? new Date(editingTaskData.date).toDateString().slice(0,10) : task.date } : task
            )
        );
        setEditingTaskId(null);
        try {
            const token = getAccessToken();
            const payload = {
                ...editingTaskData,
                date: editingTaskData.date || null,
                time: editingTaskData.time || null,
            };
            const response = await fetch(`${API_BASE_URL}${taskId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error('Failed to update task on the server.');
            }
            const updatedTaskFromServer = await response.json();
            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === taskId ? updatedTaskFromServer : task
                )
            );
        } catch (err) {
            setError(err.message);
            setTasks(originalTasks);
        }
    };
    
    // --- NEW TOGGLE COMPLETE FUNCTION ---
    const handleToggleComplete = async (taskId) => {
        const originalTasks = [...tasks];
        let updatedTask = null;

        // Optimistically update the UI
        setTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === taskId) {
                    // Find the task and flip its 'completed' status
                    updatedTask = { ...task, completed: !task.completed };
                    return updatedTask;
                }
                return task;
            })
        );

        // Send the update to the backend
        try {
            if (!updatedTask) throw new Error("Task not found locally."); // Safety check

            const token = getAccessToken();
            // We only need to send the 'completed' field for a PATCH request
            const payload = { completed: updatedTask.completed }; 

            const response = await fetch(`${API_BASE_URL}${taskId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to update task status on the server.');
            }
            // No need to update state again on success, UI is already updated.

        } catch (err) {
            setError(err.message);
            setTasks(originalTasks); // Rollback on error
        }
    };


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
            onToggleComplete={handleToggleComplete}
            error={error}
        />
    );
};

export default TasksContainer;