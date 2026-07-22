'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { db } from '@/lib/firebase/config';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { getWorkdayStatus, calculateWorkdayStreak } from '@/lib/utils/workCalendarUtils';
import { getLocalDateKey } from '@/lib/utils/dateUtils';

const STORAGE_KEY = 'work_calendar_overrides';

export function useWorkCalendar() {
    const { user } = useAuth();
    const [overrides, setOverrides] = useState({});
    const [loading, setLoading] = useState(true);

    const getLocalOverrides = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    };

    const saveLocalOverrides = (data) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('LocalStorage write error:', e);
        }
    };

    const fetchOverrides = useCallback(async () => {
        setLoading(true);
        const localData = getLocalOverrides();

        if (user?.uid) {
            try {
                const ref = collection(db, 'users', user.uid, 'workCalendarOverrides');
                const snapshot = await getDocs(ref);
                const firestoreMap = {};
                snapshot.docs.forEach(d => {
                    firestoreMap[d.id] = d.data().status;
                });
                const combined = { ...localData, ...firestoreMap };
                setOverrides(combined);
                saveLocalOverrides(combined);
            } catch (err) {
                console.warn('Firestore overrides read error, using local fallback:', err.message);
                setOverrides(localData);
            }
        } else {
            setOverrides(localData);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchOverrides();
    }, [fetchOverrides]);

    // Set day override e.g. status: 'work' | 'off' | 'leave' | 'holiday'
    const setDayOverride = async (dateStr, status) => {
        const updated = { ...overrides };
        if (!status || status === 'reset') {
            delete updated[dateStr];
        } else {
            updated[dateStr] = status;
        }

        if (user?.uid) {
            try {
                const docRef = doc(db, 'users', user.uid, 'workCalendarOverrides', dateStr);
                if (!status || status === 'reset') {
                    await deleteDoc(docRef);
                } else {
                    await setDoc(docRef, {
                        date: dateStr,
                        status,
                        updatedAt: serverTimestamp()
                    });
                }
            } catch (err) {
                console.warn('Firestore write failed, using local fallback:', err.message);
            }
        }

        setOverrides(updated);
        saveLocalOverrides(updated);
    };

    // Helper to get status of a single day
    const getDayInfo = (dateInput) => {
        const dateKey = getLocalDateKey(dateInput);
        return getWorkdayStatus(dateKey, overrides);
    };

    return {
        overrides,
        loading,
        getDayInfo,
        setDayOverride,
        calculateWorkdayStreak: (checkedInDatesSet, startDateStr) => calculateWorkdayStreak(checkedInDatesSet, overrides, startDateStr),
        refetch: fetchOverrides
    };
}
