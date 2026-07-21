'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Sidebar from '@/components/ui/Sidebar';
import MobileNav from '@/components/ui/MobileNav';
import BrainDump from '@/components/quick/BrainDump';
import EyeProtection from '@/components/wellness/EyeProtection';
import { useRewards } from '@/lib/hooks/useRewards';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import styles from './dashboard.module.css';
import { Loader2, Coins } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth();
    const { coins, addCoins } = useRewards();
    const router = useRouter();

    const [showBrainDump, setShowBrainDump] = useState(false);
    const [eyeProtectionEnabled, setEyeProtectionEnabled] = useState(true);

    // Keyboard shortcut for Brain Dump (Ctrl+Space)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                setShowBrainDump(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handle Brain Dump item
    const handleAddBrainDumpItem = useCallback(async (item) => {
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                inbox: arrayUnion({
                    ...item,
                    addedAt: new Date().toISOString(),
                }),
            });
        } catch (error) {
            console.error('Error adding inbox item:', error);
        }
    }, [user]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className={styles.spinner} size={40} />
                <p>Đang tải...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className={styles.dashboardWrapper}>
            <Sidebar />

            {/* Coin Display */}
            <div className={styles.coinDisplay}>
                <Coins size={16} />
                <span>{coins?.toLocaleString() || 0}</span>
            </div>

            <main className={styles.mainContent}>
                {children}
            </main>

            <MobileNav />

            {/* Brain Dump Modal */}
            <BrainDump
                isOpen={showBrainDump}
                onClose={() => setShowBrainDump(false)}
                onAddItem={handleAddBrainDumpItem}
            />

            {/* Eye Protection Reminder */}
            <EyeProtection enabled={eyeProtectionEnabled} />

            {/* Quick Access hint */}
            <div className={styles.quickAccessHint}>
                <kbd>Ctrl</kbd>+<kbd>Space</kbd> để Brain Dump
            </div>
        </div>
    );
}
