import React, { useState, useEffect } from 'react';
import TasksView from '../components/TaskView';
import '../styles/tasks.css';
import { fetchWithAuth, getAccessToken } from '../users/UserAuth'; 
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8000/api/tasks/';

const TasksContainer = () => {
    const [tasks, setTasks] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState(null);
    const {user} = useAuth()

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

                const response = await fetchWithAuth(API_BASE_URL);

                if (!response.ok) throw new Error('Could not fetch tasks.');
                const data = await response.json();
                setTasks(data);
            } catch (err) {
                setError(err.message);
            }
        };
        if (user){
            fetchTasks()
        }
    }, [user]);

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
            const payload = {
                description: newTask.description,
                date: newTaskDate || null,
                time: newTaskTime || null,
                priority: newTask.priority,
            };

            const response = await fetchWithAuth(API_BASE_URL, {
                method: 'POST',
                body: payload, // Pass the object directly
            });

            if (!response.ok) throw new Error('Failed to save task to the server.');
            const savedTask = await response.json();
            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === tempId ? { ...savedTask, isSaving: false } : task
                )
            );
            toast.success("Task added successfully!");
        } catch (err) {
            setError('Failed to save. Please try again.');
            toast.error("Failed to add task.");
            setTasks(prevTasks => prevTasks.filter(task => task.id !== tempId));
        }
    };

    const handleDeleteTask = async (taskId) => {
        const originalTasks = [...tasks];
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}${taskId}/`, {
                method: 'DELETE',
            });

            if (response.status !== 204 && !response.ok) {
                throw new Error('Failed to delete the task from the server.');
            }
            toast.success("Task deleted successfully!");
        } catch (err) {
            setError(err.message);
            toast.error("Failed to delete task.");
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
            const payload = {
                ...editingTaskData,
                date: editingTaskData.date || null,
                time: editingTaskData.time || null,
            };

            const response = await fetchWithAuth(`${API_BASE_URL}${taskId}/`, {
                method: 'PATCH',
                body: payload // Pass the object directly
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
            toast.success("Task updated successfully!");
        } catch (err) {
            setError(err.message);
            toast.error("Failed to update task.");
            setTasks(originalTasks);
        }
    };
    
    const handleToggleComplete = async (taskId) => {
        const originalTasks = [...tasks];
        
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (!taskToUpdate) {
            setError("Task not found locally.");
            return;
        }
        const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };

        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? updatedTask : task
            )
        );
        
        try {
            const payload = { completed: updatedTask.completed };
            
            const response = await fetchWithAuth(`${API_BASE_URL}${taskId}/`, {
                method: 'PATCH',
                body: payload // Pass the object directly
            });
            
            if (!response.ok) {
                throw new Error('Failed to update task status on the server.');
            }
        } catch (err) {
            setError(err.message);
            setTasks(originalTasks);
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