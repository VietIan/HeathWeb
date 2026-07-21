'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    onSnapshot,
    query,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/components/providers/AuthProvider';

// Vietnamese holidays for 2025
const VIETNAMESE_HOLIDAYS_2025 = [
    { date: '2025-01-01', title: 'Tết Dương lịch', emoji: '🎊', type: 'holiday', color: '#F87171' },
    { date: '2025-01-28', title: 'Tết Nguyên Đán (28 Tết)', emoji: '🏠', type: 'holiday', color: '#F87171' },
    { date: '2025-01-29', title: 'Tết Nguyên Đán (29 Tết)', emoji: '🏠', type: 'holiday', color: '#F87171' },
    { date: '2025-01-30', title: 'Tết Nguyên Đán (30 Tết)', emoji: '🧧', type: 'holiday', color: '#F87171' },
    { date: '2025-01-31', title: 'Tết Nguyên Đán (Mùng 1)', emoji: '🧧', type: 'holiday', color: '#F87171' },
    { date: '2025-02-01', title: 'Tết Nguyên Đán (Mùng 2)', emoji: '🧧', type: 'holiday', color: '#F87171' },
    { date: '2025-02-02', title: 'Tết Nguyên Đán (Mùng 3)', emoji: '🧧', type: 'holiday', color: '#F87171' },
    { date: '2025-02-03', title: 'Tết Nguyên Đán (Mùng 4)', emoji: '🧧', type: 'holiday', color: '#F87171' },
    { date: '2025-02-04', title: 'Tết Nguyên Đán (Mùng 5)', emoji: '🧧', type: 'holiday', color: '#F87171' },
    { date: '2025-04-07', title: 'Giỗ Tổ Hùng Vương 10/3 Âm', emoji: '🇻🇳', type: 'holiday', color: '#F87171' },
    { date: '2025-04-30', title: 'Ngày Giải phóng miền Nam', emoji: '🇻🇳', type: 'holiday', color: '#F87171' },
    { date: '2025-05-01', title: 'Ngày Quốc tế Lao động', emoji: '✊', type: 'holiday', color: '#F87171' },
    { date: '2025-09-02', title: 'Ngày Quốc khánh', emoji: '🇻🇳', type: 'holiday', color: '#F87171' },
    { date: '2025-12-25', title: 'Lễ Giáng sinh', emoji: '🎄', type: 'event', color: '#4ADE80' },
    { date: '2025-12-31', title: 'Giao thừa', emoji: '🎆', type: 'event', color: '#FBBF24' },
];

export const useCalendar = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Realtime listener for events
    useEffect(() => {
        if (!user) {
            setEvents([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const eventsRef = collection(db, 'users', user.uid, 'events');
        const q = query(eventsRef);

        // Realtime subscription
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userEvents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isUserEvent: true
            }));

            // Combine user events with holidays
            const allEvents = [...userEvents, ...VIETNAMESE_HOLIDAYS_2025.map(h => ({
                ...h,
                id: `holiday-${h.date}`,
                isHoliday: true,
                isCountdown: false
            }))];

            setEvents(allEvents);
            setLoading(false);
            setError(null);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const createEvent = async (eventData) => {
        if (!user) return;
        try {
            const eventsRef = collection(db, 'users', user.uid, 'events');
            await addDoc(eventsRef, {
                ...eventData,
                isCountdown: eventData.isCountdown || false,
                createdAt: serverTimestamp()
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const removeEvent = async (eventId) => {
        if (!user) return;
        // Don't allow deleting holidays
        if (eventId.startsWith('holiday-')) return;

        try {
            const eventRef = doc(db, 'users', user.uid, 'events', eventId);
            await deleteDoc(eventRef);
        } catch (err) {
            setError(err.message);
        }
    };

    const getEventsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(event => event.date === dateStr);
    };

    return {
        events,
        selectedDate,
        setSelectedDate,
        loading,
        error,
        createEvent,
        removeEvent,
        getEventsForDate
    };
};
