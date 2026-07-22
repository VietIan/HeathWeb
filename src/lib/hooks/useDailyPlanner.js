'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
    addDailyHabit,
    addPlannerInboxItem,
    deleteDailyHabit,
    getDailyPlannerData,
    resolvePlannerInboxItem,
    updateDailyPlan,
} from '@/lib/firebase/dailyPlanner';

const EMPTY_PLAN = {
    focusTaskIds: [],
    completedHabitIds: [],
    note: '',
};

export const useDailyPlanner = (dateKey) => {
    const { user } = useAuth();
    const [plan, setPlan] = useState(EMPTY_PLAN);
    const [habits, setHabits] = useState([]);
    const [inbox, setInbox] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        if (!user || !dateKey) {
            setPlan(EMPTY_PLAN);
            setHabits([]);
            setInbox([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getDailyPlannerData(user.uid, dateKey);
            setPlan(data.plan);
            setHabits(data.habits);
            setInbox(data.inbox);
            setError(null);
        } catch (err) {
            setError(err.message || 'Không thể tải kế hoạch hôm nay.');
        } finally {
            setLoading(false);
        }
    }, [dateKey, user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const persistPlan = async (updates) => {
        if (!user) return false;

        const previousPlan = plan;
        const nextPlan = { ...plan, ...updates };
        setPlan(nextPlan);
        setSaving(true);

        try {
            await updateDailyPlan(user.uid, dateKey, updates);
            setError(null);
            return true;
        } catch (err) {
            setPlan(previousPlan);
            setError(err.message || 'Không thể lưu thay đổi.');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const addFocusTask = async (taskId) => {
        if (plan.focusTaskIds.includes(taskId)) return true;
        if (plan.focusTaskIds.length >= 3) {
            setError('Top 3 hôm nay đã đủ. Hãy bỏ một việc trước khi thêm.');
            return false;
        }
        return persistPlan({ focusTaskIds: [...plan.focusTaskIds, taskId] });
    };

    const removeFocusTask = (taskId) => (
        persistPlan({ focusTaskIds: plan.focusTaskIds.filter((id) => id !== taskId) })
    );

    const toggleHabit = (habitId) => {
        const isCompleted = plan.completedHabitIds.includes(habitId);
        const completedHabitIds = isCompleted
            ? plan.completedHabitIds.filter((id) => id !== habitId)
            : [...plan.completedHabitIds, habitId];
        return persistPlan({ completedHabitIds });
    };

    const saveNote = (note) => persistPlan({ note });

    const createHabit = async (habitData) => {
        if (!user || !habitData.name?.trim()) return false;
        try {
            setSaving(true);
            const habitRef = await addDailyHabit(user.uid, habitData);
            setHabits((current) => [...current, {
                id: habitRef.id,
                ...habitData,
                name: habitData.name.trim(),
                active: true,
                createdAt: new Date(),
            }]);
            setError(null);
            return true;
        } catch (err) {
            setError(err.message || 'Không thể thêm thói quen.');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const removeHabit = async (habitId) => {
        if (!user) return false;
        try {
            setSaving(true);
            await deleteDailyHabit(user.uid, habitId);
            setHabits((current) => current.filter((habit) => habit.id !== habitId));
            if (plan.completedHabitIds.includes(habitId)) {
                await persistPlan({
                    completedHabitIds: plan.completedHabitIds.filter((id) => id !== habitId),
                });
            }
            setError(null);
            return true;
        } catch (err) {
            setError(err.message || 'Không thể xóa thói quen.');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const captureInboxItem = async (text) => {
        if (!user || !text.trim()) return null;
        try {
            setSaving(true);
            const item = await addPlannerInboxItem(user.uid, text);
            setInbox((current) => [item, ...current]);
            setError(null);
            return item;
        } catch (err) {
            setError(err.message || 'Không thể ghi nhanh.');
            return null;
        } finally {
            setSaving(false);
        }
    };

    const resolveInboxItem = async (itemId, resolution) => {
        if (!user) return false;
        const previousInbox = inbox;
        setInbox((current) => current.filter((item) => item.id !== itemId));
        try {
            await resolvePlannerInboxItem(user.uid, itemId, resolution);
            setError(null);
            return true;
        } catch (err) {
            setInbox(previousInbox);
            setError(err.message || 'Không thể xử lý mục trong inbox.');
            return false;
        }
    };

    const clearError = () => setError(null);

    return {
        plan,
        habits,
        inbox,
        loading,
        saving,
        error,
        addFocusTask,
        removeFocusTask,
        toggleHabit,
        saveNote,
        createHabit,
        removeHabit,
        captureInboxItem,
        resolveInboxItem,
        clearError,
        refresh,
    };
};

