'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { useAuth } from '@/components/providers/AuthProvider';

const DEFAULT_REWARDS = [
    { id: 'tea', name: 'Trà sữa 🧋', cost: 100, description: 'Thưởng bản thân 1 ly trà sữa' },
    { id: 'movie', name: 'Xem phim 🎬', cost: 300, description: 'Đi xem phim cuối tuần' },
    { id: 'game', name: 'Mua game 🎮', cost: 500, description: 'Mua game mới trên Steam' },
    { id: 'day-off', name: 'Nghỉ ngơi 🛌', cost: 200, description: '1 buổi nghỉ ngơi không làm gì' },
    { id: 'food', name: 'Đồ ăn ngon 🍕', cost: 150, description: 'Order đồ ăn yêu thích' },
];

// Earning rates
const EARNING_RATES = {
    taskComplete: 10,
    pomodoroComplete: 25,
    dailyCheckIn: 50,
    weeklyStreak: 200,
    moodLogged: 5,
    journalWritten: 15,
};

export const useRewards = () => {
    const { user } = useAuth();
    const [coins, setCoins] = useState(0);
    const [rewards, setRewards] = useState(DEFAULT_REWARDS);
    const [redeemedHistory, setRedeemedHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load user rewards data
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setCoins(data.coins || 0);
                setRewards(data.customRewards || DEFAULT_REWARDS);
                setRedeemedHistory(data.redeemedHistory || []);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Add coins
    const addCoins = useCallback(async (amount, reason) => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userRef, {
                coins: coins + amount,
                coinHistory: arrayUnion({
                    amount,
                    reason,
                    timestamp: new Date().toISOString(),
                    type: 'earned',
                }),
            });
        } catch (error) {
            console.error('Error adding coins:', error);
        }
    }, [user, coins]);

    // Redeem reward
    const redeemReward = useCallback(async (rewardId) => {
        if (!user) return { success: false, message: 'Chưa đăng nhập' };

        const reward = rewards.find(r => r.id === rewardId);
        if (!reward) return { success: false, message: 'Phần thưởng không tồn tại' };
        if (coins < reward.cost) return { success: false, message: 'Không đủ xu' };

        const userRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userRef, {
                coins: coins - reward.cost,
                redeemedHistory: arrayUnion({
                    rewardId,
                    rewardName: reward.name,
                    cost: reward.cost,
                    redeemedAt: new Date().toISOString(),
                }),
                coinHistory: arrayUnion({
                    amount: -reward.cost,
                    reason: `Đổi thưởng: ${reward.name}`,
                    timestamp: new Date().toISOString(),
                    type: 'redeemed',
                }),
            });

            return { success: true, message: `Đã đổi ${reward.name}!` };
        } catch (error) {
            console.error('Error redeeming reward:', error);
            return { success: false, message: 'Có lỗi xảy ra' };
        }
    }, [user, coins, rewards]);

    // Add custom reward
    const addCustomReward = useCallback(async (reward) => {
        if (!user) return;

        const newReward = {
            id: `custom-${Date.now()}`,
            ...reward,
            isCustom: true,
        };

        const userRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userRef, {
                customRewards: [...rewards, newReward],
            });
        } catch (error) {
            console.error('Error adding custom reward:', error);
        }
    }, [user, rewards]);

    // Remove custom reward
    const removeCustomReward = useCallback(async (rewardId) => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userRef, {
                customRewards: rewards.filter(r => r.id !== rewardId),
            });
        } catch (error) {
            console.error('Error removing custom reward:', error);
        }
    }, [user, rewards]);

    return {
        coins,
        rewards,
        redeemedHistory,
        loading,
        addCoins,
        redeemReward,
        addCustomReward,
        removeCustomReward,
        EARNING_RATES,
    };
};
