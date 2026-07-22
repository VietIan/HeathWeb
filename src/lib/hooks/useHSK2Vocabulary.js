'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { db } from '@/lib/firebase/config';
import {
    collection,
    query,
    getDocs,
    doc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { parseHSKLine, parseBatchHSKText } from '@/lib/utils/hskParser';
import { getLocalDateKey } from '@/lib/utils/dateUtils';

const STORAGE_KEY = 'hsk2_vocab_cache';

export function useHSK2Vocabulary() {
    const { user } = useAuth();
    const [vocabList, setVocabList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper to get local cache
    const getLocalCache = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    };

    // Helper to save local cache
    const saveLocalCache = (items) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.error('LocalStorage write error:', e);
        }
    };

    // Load vocabulary
    const fetchVocab = useCallback(async () => {
        setLoading(true);
        setError(null);

        const localItems = getLocalCache();

        if (user?.uid) {
            try {
                const ref = collection(db, 'users', user.uid, 'hsk2_vocabulary');
                const q = query(ref, orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

                // Combine Firestore items with local items if any
                const combinedMap = new Map();
                items.forEach(it => combinedMap.set(it.id, it));
                localItems.forEach(it => {
                    if (!combinedMap.has(it.id)) combinedMap.set(it.id, it);
                });

                const finalItems = Array.from(combinedMap.values());
                setVocabList(finalItems);
                saveLocalCache(finalItems);
            } catch (err) {
                console.warn('Firestore permissions/read error, using local storage fallback:', err.message);
                setVocabList(localItems);
            }
        } else {
            setVocabList(localItems);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchVocab();
    }, [fetchVocab]);

    // Save single item
    const saveVocabItem = async (itemData) => {
        const todayStr = getLocalDateKey(new Date());
        const newItem = {
            ...itemData,
            hskLevel: itemData.hskLevel || 2,
            tags: itemData.tags || ['HSK2'],
            learningStatus: itemData.learningStatus || 'new',
            nextReviewAt: itemData.nextReviewAt || new Date().toISOString(),
            reviewCount: itemData.reviewCount || 0,
            createdDate: itemData.createdDate || todayStr,
            createdAt: new Date().toISOString()
        };

        let savedDoc = { id: 'vocab_' + Date.now(), ...newItem };

        if (user?.uid) {
            try {
                const ref = collection(db, 'users', user.uid, 'hsk2_vocabulary');
                const docRef = await addDoc(ref, {
                    ...newItem,
                    createdAt: serverTimestamp()
                });
                savedDoc.id = docRef.id;
            } catch (err) {
                console.warn('Firestore write failed due to rules/permissions. Saved locally:', err.message);
            }
        }

        const updated = [savedDoc, ...vocabList.filter(v => v.id !== savedDoc.id)];
        setVocabList(updated);
        saveLocalCache(updated);
        return savedDoc;
    };

    // Bulk Save
    const bulkImportVocab = async (rawText) => {
        const { validItems, errors } = parseBatchHSKText(rawText);
        if (validItems.length === 0) {
            return { success: false, importedCount: 0, errors };
        }

        const existingKeys = new Set(vocabList.map(v => `${v.hanzi}_${v.pinyin}`.toLowerCase()));
        const uniqueItemsToImport = validItems.filter(item => {
            const key = `${item.hanzi}_${item.pinyin}`.toLowerCase();
            return !existingKeys.has(key);
        });

        const skippedCount = validItems.length - uniqueItemsToImport.length;
        let addedDocs = [];

        if (user?.uid) {
            try {
                const ref = collection(db, 'users', user.uid, 'hsk2_vocabulary');
                for (const item of uniqueItemsToImport) {
                    const docRef = await addDoc(ref, {
                        ...item,
                        createdAt: serverTimestamp()
                    });
                    addedDocs.push({ id: docRef.id, ...item, createdAt: new Date().toISOString() });
                }
            } catch (err) {
                console.warn('Firestore bulk insert failed due to rules. Saving locally:', err.message);
                addedDocs = uniqueItemsToImport.map((item, idx) => ({
                    id: 'local_bulk_' + Date.now() + '_' + idx,
                    ...item,
                    createdAt: new Date().toISOString()
                }));
            }
        } else {
            addedDocs = uniqueItemsToImport.map((item, idx) => ({
                id: 'local_bulk_' + Date.now() + '_' + idx,
                ...item,
                createdAt: new Date().toISOString()
            }));
        }

        const updated = [...addedDocs, ...vocabList];
        setVocabList(updated);
        saveLocalCache(updated);

        return {
            success: true,
            importedCount: addedDocs.length,
            skippedCount,
            errors
        };
    };

    // Review word (Spaced Repetition)
    const reviewWord = async (wordId, rating) => {
        const targetWord = vocabList.find(w => w.id === wordId);
        if (!targetWord) return;

        let intervalDays = 1;
        let newStatus = targetWord.learningStatus || 'learning';

        switch (rating) {
            case 'again':
                intervalDays = 0.5;
                newStatus = 'learning';
                break;
            case 'hard':
                intervalDays = 1;
                newStatus = 'learning';
                break;
            case 'good':
                intervalDays = 3;
                newStatus = 'learning';
                break;
            case 'easy':
                intervalDays = 7;
                newStatus = 'mastered';
                break;
            default:
                intervalDays = 1;
        }

        const nextReviewDate = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString();
        const updates = {
            learningStatus: newStatus,
            reviewCount: (targetWord.reviewCount || 0) + 1,
            lastReviewedAt: new Date().toISOString(),
            nextReviewAt: nextReviewDate
        };

        if (user?.uid && !wordId.startsWith('local_') && !wordId.startsWith('vocab_')) {
            try {
                const docRef = doc(db, 'users', user.uid, 'hsk2_vocabulary', wordId);
                await updateDoc(docRef, updates);
            } catch (err) {
                console.warn('Firestore update failed:', err.message);
            }
        }

        const updatedList = vocabList.map(w => w.id === wordId ? { ...w, ...updates } : w);
        setVocabList(updatedList);
        saveLocalCache(updatedList);
    };

    // Delete word
    const deleteWord = async (wordId) => {
        if (user?.uid && !wordId.startsWith('local_') && !wordId.startsWith('vocab_')) {
            try {
                const docRef = doc(db, 'users', user.uid, 'hsk2_vocabulary', wordId);
                await deleteDoc(docRef);
            } catch (err) {
                console.warn('Firestore delete error:', err.message);
            }
        }
        const updatedList = vocabList.filter(w => w.id !== wordId);
        setVocabList(updatedList);
        saveLocalCache(updatedList);
    };

    // Stats
    const nowISO = new Date().toISOString();
    const todayReviewQueue = vocabList.filter(w => !w.nextReviewAt || w.nextReviewAt <= nowISO || w.learningStatus === 'new');
    const masteredCount = vocabList.filter(w => w.learningStatus === 'mastered').length;
    const learningCount = vocabList.filter(w => w.learningStatus === 'learning').length;
    const newCount = vocabList.filter(w => w.learningStatus === 'new' || !w.learningStatus).length;

    return {
        vocabList,
        loading,
        error,
        todayReviewQueue,
        stats: {
            total: vocabList.length,
            newCount,
            learningCount,
            masteredCount,
            todayQueueCount: todayReviewQueue.length
        },
        saveVocabItem,
        bulkImportVocab,
        reviewWord,
        deleteWord,
        refetch: fetchVocab
    };
}
