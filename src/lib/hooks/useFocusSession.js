'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/components/providers/AuthProvider';

const POMODORO_PRESETS = {
    short: { work: 25 * 60, break: 5 * 60, label: '25 phút' },
    long: { work: 50 * 60, break: 10 * 60, label: '50 phút' },
};

export const useFocusSession = () => {
    const { user } = useAuth();
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [mode, setMode] = useState('work'); // 'work' | 'break'
    const [preset, setPreset] = useState('short');
    const [timeLeft, setTimeLeft] = useState(POMODORO_PRESETS.short.work);
    const [currentTask, setCurrentTask] = useState(null);
    const [sessionsToday, setSessionsToday] = useState(0);
    const [totalPomodoros, setTotalPomodoros] = useState(0);
    const [coinsEarned, setCoinsEarned] = useState(0);

    const today = new Date().toISOString().split('T')[0];

    // Load stats
    useEffect(() => {
        if (!user) return;

        const statsRef = doc(db, 'users', user.uid, 'focusStats', today);
        const unsubscribe = onSnapshot(statsRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setSessionsToday(data.sessions || 0);
                setTotalPomodoros(data.totalPomodoros || 0);
            }
        });

        return () => unsubscribe();
    }, [user, today]);

    // Timer logic
    useEffect(() => {
        let interval = null;

        if (isRunning && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleSessionComplete();
        }

        return () => clearInterval(interval);
    }, [isRunning, isPaused, timeLeft]);

    const handleSessionComplete = async () => {
        if (mode === 'work') {
            // Complete pomodoro
            await recordSession();

            // Switch to break
            setMode('break');
            setTimeLeft(POMODORO_PRESETS[preset].break);

            // Play notification sound
            playNotificationSound();

            // Show notification
            if (Notification.permission === 'granted') {
                new Notification('🍅 Pomodoro hoàn thành!', {
                    body: 'Nghỉ ngơi một chút nhé!',
                    icon: '/icons/icon-192x192.png',
                });
            }
        } else {
            // Break complete, ready for next work session
            setMode('work');
            setTimeLeft(POMODORO_PRESETS[preset].work);
            setIsRunning(false);

            if (Notification.permission === 'granted') {
                new Notification('⏰ Hết giờ nghỉ!', {
                    body: 'Sẵn sàng cho session tiếp theo?',
                    icon: '/icons/icon-192x192.png',
                });
            }
        }
    };

    const recordSession = async () => {
        if (!user) return;

        const statsRef = doc(db, 'users', user.uid, 'focusStats', today);
        const coinsToAdd = preset === 'short' ? 25 : 50;

        try {
            const docSnap = await getDoc(statsRef);
            if (docSnap.exists()) {
                await updateDoc(statsRef, {
                    sessions: (docSnap.data().sessions || 0) + 1,
                    totalMinutes: (docSnap.data().totalMinutes || 0) + (POMODORO_PRESETS[preset].work / 60),
                    taskSessions: arrayUnion({
                        taskId: currentTask?.id || null,
                        taskTitle: currentTask?.title || 'Free focus',
                        completedAt: new Date().toISOString(),
                        duration: POMODORO_PRESETS[preset].work / 60,
                    }),
                });
            } else {
                await setDoc(statsRef, {
                    sessions: 1,
                    totalMinutes: POMODORO_PRESETS[preset].work / 60,
                    date: today,
                    taskSessions: [{
                        taskId: currentTask?.id || null,
                        taskTitle: currentTask?.title || 'Free focus',
                        completedAt: new Date().toISOString(),
                        duration: POMODORO_PRESETS[preset].work / 60,
                    }],
                });
            }

            // Add coins
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                await updateDoc(userRef, {
                    coins: (userSnap.data().coins || 0) + coinsToAdd,
                });
            }

            setSessionsToday((prev) => prev + 1);
            setCoinsEarned(coinsToAdd);
            setTimeout(() => setCoinsEarned(0), 3000);
        } catch (error) {
            console.error('Error recording session:', error);
        }
    };

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.5;
            audio.play();
        } catch (e) {
            console.log('Audio not available');
        }
    };

    const startSession = useCallback((task = null) => {
        setCurrentTask(task);
        setMode('work');
        setTimeLeft(POMODORO_PRESETS[preset].work);
        setIsRunning(true);
        setIsPaused(false);

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [preset]);

    const pauseSession = useCallback(() => {
        setIsPaused(true);
    }, []);

    const resumeSession = useCallback(() => {
        setIsPaused(false);
    }, []);

    const stopSession = useCallback(() => {
        setIsRunning(false);
        setIsPaused(false);
        setMode('work');
        setTimeLeft(POMODORO_PRESETS[preset].work);
        setCurrentTask(null);
    }, [preset]);

    const skipBreak = useCallback(() => {
        setMode('work');
        setTimeLeft(POMODORO_PRESETS[preset].work);
        setIsRunning(false);
    }, [preset]);

    const changePreset = useCallback((newPreset) => {
        if (!isRunning) {
            setPreset(newPreset);
            setTimeLeft(POMODORO_PRESETS[newPreset].work);
        }
    }, [isRunning]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = mode === 'work'
        ? ((POMODORO_PRESETS[preset].work - timeLeft) / POMODORO_PRESETS[preset].work) * 100
        : ((POMODORO_PRESETS[preset].break - timeLeft) / POMODORO_PRESETS[preset].break) * 100;

    return {
        // State
        isRunning,
        isPaused,
        mode,
        preset,
        timeLeft,
        currentTask,
        sessionsToday,
        coinsEarned,
        progress,

        // Computed
        formattedTime: formatTime(timeLeft),
        presetLabel: POMODORO_PRESETS[preset].label,

        // Actions
        startSession,
        pauseSession,
        resumeSession,
        stopSession,
        skipBreak,
        changePreset,

        // Constants
        PRESETS: POMODORO_PRESETS,
    };
};
