'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/components/providers/AuthProvider';

const DEFAULT_PET_STATE = {
    happiness: 50,
    evolutionLevel: 1,
    lastInteraction: null,
    totalCheckins: 0,
    consecutiveHighHappyDays: 0,
    createdAt: new Date().toISOString(),
};

export const useSoulPet = () => {
    const { user } = useAuth();
    const [petState, setPetState] = useState(DEFAULT_PET_STATE);
    const [loading, setLoading] = useState(true);

    // Load pet state from Firestore
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const petRef = doc(db, 'users', user.uid, 'gamification', 'pet');

        const unsubscribe = onSnapshot(petRef, (snapshot) => {
            if (snapshot.exists()) {
                setPetState(snapshot.data());
            } else {
                // Initialize pet for new users
                setDoc(petRef, DEFAULT_PET_STATE);
                setPetState(DEFAULT_PET_STATE);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Check for happiness decay (called on load)
    useEffect(() => {
        if (!user || !petState.lastInteraction) return;

        const lastInteraction = new Date(petState.lastInteraction);
        const now = new Date();
        const hoursSinceInteraction = (now - lastInteraction) / (1000 * 60 * 60);

        // Decay happiness if no interaction for 24+ hours
        if (hoursSinceInteraction >= 24) {
            const decayAmount = Math.min(Math.floor(hoursSinceInteraction / 24) * 15, 50);
            const newHappiness = Math.max(0, petState.happiness - decayAmount);

            if (newHappiness !== petState.happiness) {
                updatePetState({ happiness: newHappiness });
            }
        }
    }, [user, petState.lastInteraction]);

    // Update pet state in Firestore
    const updatePetState = useCallback(async (updates) => {
        if (!user) return;

        const petRef = doc(db, 'users', user.uid, 'gamification', 'pet');

        try {
            await updateDoc(petRef, {
                ...updates,
                lastInteraction: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error updating pet state:', error);
        }
    }, [user]);

    // Called when user checks in
    const onCheckin = useCallback(async () => {
        const newHappiness = Math.min(100, petState.happiness + 10);
        const newTotalCheckins = petState.totalCheckins + 1;

        let newConsecutiveDays = petState.consecutiveHighHappyDays;
        let newEvolutionLevel = petState.evolutionLevel;

        // Track consecutive high happiness days
        if (newHappiness >= 80) {
            newConsecutiveDays += 1;
        } else {
            newConsecutiveDays = 0;
        }

        // Evolution check
        if (newConsecutiveDays >= 3 && petState.evolutionLevel < 3) {
            newEvolutionLevel = petState.evolutionLevel + 1;
            newConsecutiveDays = 0; // Reset counter after evolution
        }

        await updatePetState({
            happiness: newHappiness,
            totalCheckins: newTotalCheckins,
            consecutiveHighHappyDays: newConsecutiveDays,
            evolutionLevel: newEvolutionLevel,
        });

        return {
            happinessGain: 10,
            evolved: newEvolutionLevel > petState.evolutionLevel,
            newLevel: newEvolutionLevel,
        };
    }, [petState, updatePetState]);

    // Called when user completes a task
    const onTaskComplete = useCallback(async () => {
        const newHappiness = Math.min(100, petState.happiness + 5);

        await updatePetState({
            happiness: newHappiness,
        });

        return { happinessGain: 5 };
    }, [petState, updatePetState]);

    // Called when user completes a Pomodoro
    const onPomodoroComplete = useCallback(async () => {
        const newHappiness = Math.min(100, petState.happiness + 8);

        await updatePetState({
            happiness: newHappiness,
        });

        return { happinessGain: 8 };
    }, [petState, updatePetState]);

    // Feed/interact with pet (manual boost)
    const feedPet = useCallback(async () => {
        const newHappiness = Math.min(100, petState.happiness + 15);

        await updatePetState({
            happiness: newHappiness,
        });

        return { happinessGain: 15 };
    }, [petState, updatePetState]);

    // Get pet mood based on happiness
    const getPetMood = useCallback(() => {
        if (petState.happiness >= 80) return 'excited';
        if (petState.happiness >= 60) return 'happy';
        if (petState.happiness >= 40) return 'neutral';
        if (petState.happiness >= 20) return 'sad';
        return 'very_sad';
    }, [petState.happiness]);

    return {
        petState,
        loading,
        onCheckin,
        onTaskComplete,
        onPomodoroComplete,
        feedPet,
        getPetMood,
    };
};
