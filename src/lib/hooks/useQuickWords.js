'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/lib/firebase/config';
import {
    collection, getDocs, addDoc, deleteDoc, doc,
    serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { useAuth } from '@/components/providers/AuthProvider';

export const useQuickWords = () => {
    const { user } = useAuth();
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const today = new Date().toISOString().split('T')[0];

    // Load all quick words
    const loadWords = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const quickRef = collection(db, 'users', user.uid, 'quickWords');
            const q = query(quickRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setWords(data);
        } catch (error) {
            console.error('Error loading quick words:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadWords();
    }, [loadWords]);

    // Add a new word
    const addWord = useCallback(async (word, meaning, type = 'word') => {
        if (!user || !word.trim()) return;
        try {
            const quickRef = collection(db, 'users', user.uid, 'quickWords');
            const wordData = {
                word: word.trim(),
                meaning: meaning.trim(),
                type,
                date: today,
                createdAt: serverTimestamp()
            };
            const docRef = await addDoc(quickRef, wordData);
            const newWord = { id: docRef.id, ...wordData, createdAt: new Date() };
            setWords(prev => [newWord, ...prev]);
            return docRef.id;
        } catch (error) {
            console.error('Error adding quick word:', error);
            throw error;
        }
    }, [user, today]);

    // Delete a word
    const deleteWord = useCallback(async (wordId) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'quickWords', wordId));
            setWords(prev => prev.filter(w => w.id !== wordId));
        } catch (error) {
            console.error('Error deleting quick word:', error);
        }
    }, [user]);

    // Group words by date
    const wordsByDate = useMemo(() => {
        const grouped = {};
        words.forEach(w => {
            const date = w.date || today;
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(w);
        });
        // Sort dates descending
        return Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, items]) => ({ date, items }));
    }, [words, today]);

    // Search / filter
    const filteredWords = useMemo(() => {
        if (!searchQuery.trim()) return wordsByDate;
        const q = searchQuery.toLowerCase().trim();
        const filtered = words.filter(w =>
            w.word.toLowerCase().includes(q) ||
            w.meaning.toLowerCase().includes(q)
        );
        // Group filtered results by date
        const grouped = {};
        filtered.forEach(w => {
            const date = w.date || today;
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(w);
        });
        return Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, items]) => ({ date, items }));
    }, [searchQuery, words, wordsByDate, today]);

    // Stats
    const stats = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);
        const weekStr = startOfWeek.toISOString().split('T')[0];

        const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        const thisWeek = words.filter(w => (w.date || '') >= weekStr);
        const thisMonth = words.filter(w => (w.date || '') >= startOfMonth);

        const weekWords = thisWeek.filter(w => w.type === 'word').length;
        const weekSentences = thisWeek.filter(w => w.type === 'sentence').length;
        const monthWords = thisMonth.filter(w => w.type === 'word').length;
        const monthSentences = thisMonth.filter(w => w.type === 'sentence').length;

        return {
            weekTotal: thisWeek.length,
            weekWords,
            weekSentences,
            monthTotal: thisMonth.length,
            monthWords,
            monthSentences,
            total: words.length,
            totalWords: words.filter(w => w.type === 'word').length,
            totalSentences: words.filter(w => w.type === 'sentence').length,
        };
    }, [words]);

    // Review: get random word
    const getRandomWord = useCallback(() => {
        if (words.length === 0) return null;
        const idx = Math.floor(Math.random() * words.length);
        return words[idx];
    }, [words]);

    return {
        words,
        loading,
        searchQuery,
        setSearchQuery,
        wordsByDate,
        filteredWords,
        stats,
        addWord,
        deleteWord,
        getRandomWord,
        totalCount: words.length,
    };
};
