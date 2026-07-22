'use client';

import { useState, useEffect, useCallback } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { getTasks, addTask, updateTask, deleteTask } from '@/lib/firebase/firestore';
import { useAuth } from '@/components/providers/AuthProvider';

export const useTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        if (!user) {
            setTasks([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const fetchedTasks = await getTasks(user.uid);
            setTasks(fetchedTasks);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const createTask = async (taskData) => {
        if (!user) return null;
        try {
            const taskRef = await addTask(user.uid, taskData);
            await fetchTasks();
            return taskRef;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const editTask = async (taskId, updates) => {
        if (!user) return false;
        try {
            await updateTask(user.uid, taskId, updates);
            await fetchTasks();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const removeTask = async (taskId) => {
        if (!user) return;
        try {
            await deleteTask(user.uid, taskId);
            await fetchTasks();
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleComplete = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const completed = !task.completed;
            return editTask(taskId, {
                completed,
                completedAt: completed ? serverTimestamp() : null,
            });
        }
        return false;
    };

    return {
        tasks,
        loading,
        error,
        createTask,
        editTask,
        updateTask: editTask,
        removeTask,
        toggleComplete,
        refresh: fetchTasks
    };
};
