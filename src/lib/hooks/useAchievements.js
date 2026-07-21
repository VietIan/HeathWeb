'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { ACHIEVEMENTS } from '@/lib/utils/achievements';

export const useAchievements = () => {
    const { user } = useAuth();
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [newUnlock, setNewUnlock] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load unlocked achievements
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setUnlockedAchievements(data.achievements || []);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Check and unlock achievements
    const checkAchievements = useCallback(async (context) => {
        if (!user) return;

        const newlyUnlocked = [];

        for (const achievement of ACHIEVEMENTS) {
            // Skip if already unlocked
            if (unlockedAchievements.some(a => a.id === achievement.id)) continue;

            // Check condition
            try {
                if (achievement.condition(context)) {
                    newlyUnlocked.push({
                        id: achievement.id,
                        unlockedAt: new Date().toISOString(),
                    });
                }
            } catch (e) {
                // Condition check failed, skip
            }
        }

        if (newlyUnlocked.length > 0) {
            // Save to Firestore
            const userRef = doc(db, 'users', user.uid);
            try {
                await updateDoc(userRef, {
                    achievements: arrayUnion(...newlyUnlocked),
                });

                // Show toast for first new unlock
                const firstUnlock = ACHIEVEMENTS.find(a => a.id === newlyUnlocked[0].id);
                setNewUnlock(firstUnlock);

                // Clear toast after 4 seconds
                setTimeout(() => setNewUnlock(null), 4000);
            } catch (error) {
                console.error('Error saving achievement:', error);
            }
        }

        return newlyUnlocked;
    }, [user, unlockedAchievements]);

    // Get full achievement data with unlock status
    const getAllAchievements = useCallback(() => {
        return ACHIEVEMENTS.map(achievement => {
            const unlocked = unlockedAchievements.find(a => a.id === achievement.id);
            return {
                ...achievement,
                unlocked: !!unlocked,
                unlockedAt: unlocked?.unlockedAt,
            };
        });
    }, [unlockedAchievements]);

    // Get visible achievements (filter hidden ones that aren't unlocked)
    const getVisibleAchievements = useCallback(() => {
        return ACHIEVEMENTS.filter(achievement => {
            const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
            return !achievement.hidden || isUnlocked;
        }).map(achievement => {
            const unlocked = unlockedAchievements.find(a => a.id === achievement.id);
            return {
                ...achievement,
                unlocked: !!unlocked,
                unlockedAt: unlocked?.unlockedAt,
            };
        });
    }, [unlockedAchievements]);

    // Stats
    const stats = {
        total: ACHIEVEMENTS.length,
        unlocked: unlockedAchievements.length,
        percentage: Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100),
    };

    return {
        unlockedAchievements,
        newUnlock,
        loading,
        checkAchievements,
        getAllAchievements,
        getVisibleAchievements,
        stats,
        clearNewUnlock: () => setNewUnlock(null),
    };
};
