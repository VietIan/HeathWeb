'use client';

import { useState, useEffect } from 'react';
import {
    doc,
    onSnapshot,
    collection,
    setDoc,
    updateDoc,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/components/providers/AuthProvider';
import { useWorkCalendar } from './useWorkCalendar';
import { getTodayString } from '@/lib/utils/dateUtils';
import { getStreakMessage } from '@/lib/utils/streakUtils';

export const useAttendance = () => {
    const { user } = useAuth();
    const { overrides, calculateWorkdayStreak: computeWorkdayStreak } = useWorkCalendar();
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Realtime listener for today's attendance
    useEffect(() => {
        if (!user) {
            setTodayAttendance(null);
            setHistory([]);
            setLoading(false);
            return;
        }

        const today = getTodayString();
        const attendanceRef = doc(db, 'users', user.uid, 'attendance', today);

        // Realtime subscription for today
        const unsubscribeToday = onSnapshot(attendanceRef, (docSnap) => {
            if (docSnap.exists()) {
                setTodayAttendance(docSnap.data());
            } else {
                setTodayAttendance(null);
            }
            setLoading(false);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });

        // Fetch history
        const historyRef = collection(db, 'users', user.uid, 'attendance');
        const unsubscribeHistory = onSnapshot(historyRef, (snapshot) => {
            const historyData = snapshot.docs.map(doc => ({
                date: doc.id,
                ...doc.data()
            }));
            setHistory(historyData);
        });

        return () => {
            unsubscribeToday();
            unsubscribeHistory();
        };
    }, [user]);

    const performCheckIn = async () => {
        if (!user) return { success: false, message: 'Chưa đăng nhập' };

        try {
            const today = getTodayString();
            const attendanceRef = doc(db, 'users', user.uid, 'attendance', today);
            const docSnap = await getDoc(attendanceRef);

            if (docSnap.exists() && docSnap.data().checkedIn) {
                return { success: false, message: 'Bạn đã check-in hôm nay rồi!' };
            }

            // Calculate streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const yesterdayRef = doc(db, 'users', user.uid, 'attendance', yesterdayStr);
            const yesterdaySnap = await getDoc(yesterdayRef);
            const streak = yesterdaySnap.exists() ? (yesterdaySnap.data().streak || 0) + 1 : 1;

            const now = Date.now();
            await setDoc(attendanceRef, {
                checkedIn: true,
                checkInTime: serverTimestamp(),
                startTime: now,
                endTime: null,
                pausedTime: 0,
                isPaused: false,
                pauseStartTime: null,
                totalHours: 0,
                streak
            });

            return { success: true, streak, startTime: now };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        }
    };

    const pause = async () => {
        if (!user || !todayAttendance) return { success: false };
        try {
            const today = getTodayString();
            const attendanceRef = doc(db, 'users', user.uid, 'attendance', today);

            if (todayAttendance.isPaused) {
                return { success: false, message: 'Đã tạm dừng rồi!' };
            }

            await updateDoc(attendanceRef, {
                isPaused: true,
                pauseStartTime: Date.now()
            });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const resume = async () => {
        if (!user || !todayAttendance) return { success: false };
        try {
            const today = getTodayString();
            const attendanceRef = doc(db, 'users', user.uid, 'attendance', today);

            if (!todayAttendance.isPaused) {
                return { success: false, message: 'Chưa tạm dừng!' };
            }

            const pausedDuration = Date.now() - (todayAttendance.pauseStartTime || Date.now());
            const totalPausedTime = (todayAttendance.pausedTime || 0) + pausedDuration;

            await updateDoc(attendanceRef, {
                isPaused: false,
                pauseStartTime: null,
                pausedTime: totalPausedTime
            });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const endWorkDay = async () => {
        if (!user || !todayAttendance) return { success: false };
        try {
            const today = getTodayString();
            const attendanceRef = doc(db, 'users', user.uid, 'attendance', today);

            const endTime = Date.now();
            let pausedTime = todayAttendance.pausedTime || 0;

            if (todayAttendance.isPaused && todayAttendance.pauseStartTime) {
                pausedTime += endTime - todayAttendance.pauseStartTime;
            }

            const totalMs = endTime - todayAttendance.startTime - pausedTime;
            const totalHours = Math.max(0, totalMs / (1000 * 60 * 60));

            await updateDoc(attendanceRef, {
                endTime,
                totalHours: Math.round(totalHours * 100) / 100,
                isPaused: false,
                pauseStartTime: null
            });

            return { success: true, totalHours };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const backfillCheckIn = async (dateStr) => {
        if (!user) return { success: false, message: 'Chưa đăng nhập' };

        try {
            const attendanceRef = doc(db, 'users', user.uid, 'attendance', dateStr);
            const docSnap = await getDoc(attendanceRef);

            if (docSnap.exists() && docSnap.data().checkedIn) {
                return { success: false, message: 'Ngày này đã check-in rồi!' };
            }

            // Create a fake check-in for the past date
            const checkInDate = new Date(dateStr);
            checkInDate.setHours(9, 0, 0, 0); // Default to 9:00 AM

            await setDoc(attendanceRef, {
                checkedIn: true,
                checkInTime: checkInDate,
                startTime: checkInDate.getTime(),
                endTime: new Date(checkInDate.getTime() + 8 * 60 * 60 * 1000).getTime(), // 8 hours later
                totalHours: 8,
                pausedTime: 0,
                isPaused: false,
                isBackfilled: true,
                streak: 0 // Will be recalculated dynamically by the hook
            });

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        }
    };

    // Calculate totals
    const totalWorkHours = history.reduce((sum, h) => sum + (h.totalHours || 0), 0);
    const totalWorkDays = history.filter(h => h.checkedIn).length;
    const checkedInDatesSet = new Set(history.filter(h => h.checkedIn).map(h => h.date));
    const workdayStreakResult = computeWorkdayStreak(checkedInDatesSet, '2025-12-01');
    const streak = workdayStreakResult.currentStreak;
    const streakInfo = getStreakMessage(streak);
    const hasCheckedInToday = !!todayAttendance?.checkedIn;
    const isWorking = hasCheckedInToday && !todayAttendance?.endTime;
    const isPaused = todayAttendance?.isPaused || false;

    return {
        todayAttendance,
        history,
        streak,
        streakInfo,
        hasCheckedInToday,
        isWorking,
        isPaused,
        totalWorkHours: Math.round(totalWorkHours * 10) / 10,
        totalWorkDays,
        loading,
        error,
        performCheckIn,
        pause,
        resume,
        endWorkDay,
        backfillCheckIn
    };
};
