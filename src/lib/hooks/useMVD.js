'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/components/providers/AuthProvider';
import { getTodayString } from '@/lib/utils/dateUtils';

export const useMVD = () => {
    const { user } = useAuth();
    const [todayMVD, setTodayMVD] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setTodayMVD(null);
            setHistory([]);
            setLoading(false);
            return;
        }

        const today = getTodayString();
        const mvdRef = doc(db, 'users', user.uid, 'mvd', today);

        // Realtime listener for today's MVD
        const unsubscribe = onSnapshot(mvdRef, (docSnap) => {
            if (docSnap.exists()) {
                setTodayMVD({ date: today, ...docSnap.data() });
            } else {
                setTodayMVD(null);
            }
            setLoading(false);
        });

        // Fetch history
        const fetchHistory = async () => {
            const mvdCollection = collection(db, 'users', user.uid, 'mvd');
            const snapshot = await getDocs(mvdCollection);
            const mvdList = snapshot.docs.map(doc => ({ date: doc.id, ...doc.data() }));
            setHistory(mvdList);
        };
        fetchHistory();

        return () => unsubscribe();
    }, [user]);

    const setTask = async (task) => {
        if (!user || !task.trim()) return;

        const today = getTodayString();
        const mvdRef = doc(db, 'users', user.uid, 'mvd', today);

        await setDoc(mvdRef, {
            task: task.trim(),
            completed: false,
            createdAt: serverTimestamp()
        });
    };

    const toggleComplete = async () => {
        if (!user || !todayMVD) return;

        const today = getTodayString();
        const mvdRef = doc(db, 'users', user.uid, 'mvd', today);

        await updateDoc(mvdRef, {
            completed: !todayMVD.completed
        });
    };

    const skipToday = async () => {
        if (!user || !todayMVD) return;

        const today = getTodayString();
        const mvdRef = doc(db, 'users', user.uid, 'mvd', today);

        await updateDoc(mvdRef, {
            skipped: true,
            completed: false
        });
    };

    // Stats
    const completedCount = history.filter(m => m.completed).length;
    const totalCount = history.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
        todayMVD,
        history,
        loading,
        setTask,
        toggleComplete,
        skipToday,
        stats: {
            completedCount,
            totalCount,
            completionRate
        }
    };
};
