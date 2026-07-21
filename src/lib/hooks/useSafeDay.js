'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/components/providers/AuthProvider';
import { getTodayString } from '@/lib/utils/dateUtils';

export const useSafeDay = () => {
    const { user } = useAuth();
    const [isSafeDay, setIsSafeDay] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsSafeDay(false);
            setLoading(false);
            return;
        }

        const today = getTodayString();
        const safeDayRef = doc(db, 'users', user.uid, 'safeDays', today);

        const unsubscribe = onSnapshot(safeDayRef, (docSnap) => {
            setIsSafeDay(docSnap.exists() && docSnap.data().isSafe);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const toggleSafeDay = async () => {
        if (!user) return;

        const today = getTodayString();
        const safeDayRef = doc(db, 'users', user.uid, 'safeDays', today);

        if (isSafeDay) {
            await deleteDoc(safeDayRef);
        } else {
            await setDoc(safeDayRef, {
                isSafe: true,
                createdAt: serverTimestamp()
            });
        }
    };

    return {
        isSafeDay,
        loading,
        toggleSafeDay
    };
};
