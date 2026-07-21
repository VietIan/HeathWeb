'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import {
    doc, setDoc, getDoc, updateDoc, deleteDoc,
    collection, getDocs, addDoc, serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { addRadicalsBatch } from '@/lib/firebase/firestore';
import { formatRadicalsForSeed } from '@/lib/data/radicals214';
export const useFlashcards = () => {
    const { user } = useAuth();
    const [radicals, setRadicals] = useState([]);
    const [learnedIds, setLearnedIds] = useState([]);
    const [reviewIds, setReviewIds] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [mode, setMode] = useState('learn'); // 'learn' | 'review' | 'all'
    const [loading, setLoading] = useState(true);
    const [dailyLearned, setDailyLearned] = useState(0);
    const [studyStreak, setStudyStreak] = useState(0);
    const [lastStudyDate, setLastStudyDate] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    // Load radicals from Firestore
    const loadRadicals = useCallback(async () => {
        if (!user) return;
        try {
            const radicalsRef = collection(db, 'users', user.uid, 'radicals');
            const q = query(radicalsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRadicals(data);
        } catch (error) {
            console.error('Error loading radicals:', error);
        }
    }, [user]);

    // Load progress from Firestore
    const loadProgress = useCallback(async () => {
        if (!user) return;
        try {
            const progressRef = doc(db, 'users', user.uid, 'flashcards', 'chinese_radicals');
            const docSnap = await getDoc(progressRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setLearnedIds(data.learnedIds || []);
                setReviewIds(data.reviewIds || []);
                setDailyLearned(data.dailyStats?.[today] || 0);
                setLastStudyDate(data.lastStudyDate || null);
                setStudyStreak(data.studyStreak || 0);
            }
        } catch (error) {
            console.error('Error loading flashcard progress:', error);
        }
    }, [user, today]);

    // Initial load
    useEffect(() => {
        if (!user) return;
        const init = async () => {
            setLoading(true);
            await Promise.all([loadRadicals(), loadProgress()]);
            setLoading(false);
        };
        init();
    }, [user, loadRadicals, loadProgress]);

    // Get active card list based on mode
    const getActiveCards = useCallback(() => {
        switch (mode) {
            case 'learn':
                return radicals.filter(r => !learnedIds.includes(r.id));
            case 'review':
                return radicals.filter(r => reviewIds.includes(r.id));
            case 'all':
            default:
                return radicals;
        }
    }, [mode, learnedIds, reviewIds, radicals]);

    const activeCards = getActiveCards();
    const currentCard = activeCards[currentIndex] || null;

    // ============ RADICAL CRUD ============

    const addRadical = useCallback(async (radicalData) => {
        if (!user) return;
        try {
            const radicalsRef = collection(db, 'users', user.uid, 'radicals');
            const docRef = await addDoc(radicalsRef, {
                character: radicalData.character,
                name: radicalData.name || '',
                pinyin: radicalData.pinyin || '',
                meaning: radicalData.meaning || '',
                strokes: radicalData.strokes || 0,
                examples: radicalData.examples || '',
                createdAt: serverTimestamp(),
            });
            // Update local state
            const newRadical = { id: docRef.id, ...radicalData, createdAt: new Date() };
            setRadicals(prev => [newRadical, ...prev]);
            return docRef.id;
        } catch (error) {
            console.error('Error adding radical:', error);
            throw error;
        }
    }, [user]);

    const deleteRadical = useCallback(async (radicalId) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'radicals', radicalId));
            setRadicals(prev => prev.filter(r => r.id !== radicalId));
            setLearnedIds(prev => prev.filter(id => id !== radicalId));
            setReviewIds(prev => prev.filter(id => id !== radicalId));
        } catch (error) {
            console.error('Error deleting radical:', error);
        }
    }, [user]);

    const seedRadicals = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const dataToSeed = formatRadicalsForSeed();
            await addRadicalsBatch(user.uid, dataToSeed);
            await loadRadicals(); // reload data after batch insert
        } catch (error) {
            console.error('Error seeding 214 radicals:', error);
        }
        setLoading(false);
    }, [user, loadRadicals]);

    // ============ PROGRESS TRACKING ============

    const saveProgress = useCallback(async (updates) => {
        if (!user) return;
        const progressRef = doc(db, 'users', user.uid, 'flashcards', 'chinese_radicals');
        try {
            const docSnap = await getDoc(progressRef);
            if (docSnap.exists()) {
                await updateDoc(progressRef, updates);
            } else {
                await setDoc(progressRef, {
                    learnedIds: [],
                    reviewIds: [],
                    dailyStats: {},
                    lastStudyDate: today,
                    studyStreak: 0,
                    createdAt: new Date().toISOString(),
                    ...updates,
                });
            }
        } catch (error) {
            console.error('Error saving flashcard progress:', error);
        }
    }, [user, today]);

    const markAsLearned = useCallback(async (cardId) => {
        const newLearned = [...new Set([...learnedIds, cardId])];
        const newReview = reviewIds.filter(id => id !== cardId);
        const newDailyCount = dailyLearned + 1;

        let newStreak = studyStreak;
        if (lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            newStreak = lastStudyDate === yesterdayStr ? studyStreak + 1 : 1;
        }

        await saveProgress({
            learnedIds: newLearned,
            reviewIds: newReview,
            [`dailyStats.${today}`]: newDailyCount,
            lastStudyDate: today,
            studyStreak: newStreak,
        });

        setLearnedIds(newLearned);
        setReviewIds(newReview);
        setDailyLearned(newDailyCount);
        setStudyStreak(newStreak);
        setLastStudyDate(today);

        if (currentIndex >= activeCards.length - 1) {
            setCurrentIndex(0);
        }
        setIsFlipped(false);
    }, [learnedIds, reviewIds, dailyLearned, studyStreak, lastStudyDate, today, saveProgress, currentIndex, activeCards.length]);

    const markForReview = useCallback(async (cardId) => {
        const newReview = [...new Set([...reviewIds, cardId])];
        const newLearned = learnedIds.filter(id => id !== cardId);

        await saveProgress({
            reviewIds: newReview,
            learnedIds: newLearned,
            lastStudyDate: today,
        });

        setReviewIds(newReview);
        setLearnedIds(newLearned);
        setLastStudyDate(today);

        if (currentIndex >= activeCards.length - 1) {
            setCurrentIndex(0);
        }
        setIsFlipped(false);
    }, [reviewIds, learnedIds, today, saveProgress, currentIndex, activeCards.length]);

    // ============ CARD NAVIGATION ============

    const flipCard = useCallback(() => setIsFlipped(prev => !prev), []);
    const nextCard = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % Math.max(activeCards.length, 1));
        setIsFlipped(false);
    }, [activeCards.length]);
    const prevCard = useCallback(() => {
        setCurrentIndex(prev => prev === 0 ? Math.max(activeCards.length - 1, 0) : prev - 1);
        setIsFlipped(false);
    }, [activeCards.length]);
    const switchMode = useCallback((newMode) => {
        setMode(newMode);
        setCurrentIndex(0);
        setIsFlipped(false);
    }, []);

    const resetProgress = useCallback(async () => {
        await saveProgress({
            learnedIds: [],
            reviewIds: [],
            dailyStats: {},
            studyStreak: 0,
        });
        setLearnedIds([]);
        setReviewIds([]);
        setDailyLearned(0);
        setStudyStreak(0);
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [saveProgress]);

    return {
        // State
        currentCard,
        currentIndex,
        isFlipped,
        mode,
        learnedIds,
        reviewIds,
        loading,
        dailyLearned,
        studyStreak,
        activeCards,
        radicals,
        showAddForm,

        // Computed
        totalRadicals: radicals.length,
        learnedCount: learnedIds.length,
        reviewCount: reviewIds.length,
        remainingCount: radicals.length - learnedIds.length,
        progressPercent: radicals.length > 0 ? Math.round((learnedIds.length / radicals.length) * 100) : 0,

        // Actions
        flipCard,
        nextCard,
        prevCard,
        markAsLearned,
        markForReview,
        switchMode,
        resetProgress,
        addRadical,
        deleteRadical,
        seedRadicals,
        setShowAddForm,
    };
};
