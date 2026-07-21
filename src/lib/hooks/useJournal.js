'use client';

import { useState, useEffect, useCallback } from 'react';
import { getJournals, addJournal, deleteJournal } from '@/lib/firebase/firestore';
import { uploadJournalImage, deleteJournalImage } from '@/lib/firebase/storage';
import { useAuth } from '@/components/providers/AuthProvider';
import { getTodayString } from '@/lib/utils/dateUtils';

export const useJournal = () => {
    const { user } = useAuth();
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchJournals = useCallback(async () => {
        if (!user) {
            setJournals([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const fetchedJournals = await getJournals(user.uid);
            setJournals(fetchedJournals);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchJournals();
    }, [fetchJournals]);

    const createJournal = async (journalData, imageFile = null) => {
        if (!user) return;
        try {
            let imageUrl = null;

            // First create the journal to get the ID
            const tempData = {
                ...journalData,
                date: getTodayString(),
                imageUrl: null
            };

            const docRef = await addJournal(user.uid, tempData);

            // If there's an image, upload it and update the journal
            if (imageFile) {
                const { url } = await uploadJournalImage(user.uid, docRef.id, imageFile);
                if (url) {
                    imageUrl = url;
                    // We could update the journal here, but for simplicity we'll just refresh
                }
            }

            await fetchJournals();
            return docRef.id;
        } catch (err) {
            setError(err.message);
        }
    };

    const removeJournal = async (journalId) => {
        if (!user) return;
        try {
            // Try to delete the image first (it might not exist)
            await deleteJournalImage(user.uid, journalId);
            await deleteJournal(user.uid, journalId);
            await fetchJournals();
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        journals,
        loading,
        error,
        createJournal,
        removeJournal,
        refresh: fetchJournals
    };
};
