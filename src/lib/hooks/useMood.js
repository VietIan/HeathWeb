'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMood, setMood, getMoods } from '@/lib/firebase/firestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { getTodayString } from '@/lib/utils/dateUtils';
import { calculateMoodStreak } from '@/lib/utils/moodUtils';

export const useMood = () => {
    const { user } = useAuth();
    const [todayMood, setTodayMood] = useState(null);
    const [moodHistory, setMoodHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMoodData = useCallback(async () => {
        if (!user) {
            setTodayMood(null);
            setMoodHistory([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const today = getTodayString();

            const [currentMood, allMoods] = await Promise.all([
                getMood(user.uid, today),
                getMoods(user.uid)
            ]);

            setTodayMood(currentMood);
            setMoodHistory(allMoods);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMoodData();
    }, [fetchMoodData]);

    const saveMood = async (moodData) => {
        if (!user) return;
        try {
            const today = getTodayString();
            await setMood(user.uid, today, moodData);
            await fetchMoodData();
        } catch (err) {
            setError(err.message);
        }
    };

    const streak = calculateMoodStreak(moodHistory);

    return {
        todayMood,
        moodHistory,
        streak,
        loading,
        error,
        saveMood,
        refresh: fetchMoodData
    };
};
