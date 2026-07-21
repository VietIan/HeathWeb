import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/components/providers/AuthProvider';

export function useDebtTracker() {
    const { user } = useAuth();
    const [debtData, setDebtData] = useState({
        installments: Array(6).fill(null).map((_, i) => ({ id: i + 1, isPaid: false }))
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchDebt = async () => {
            try {
                const docRef = doc(db, 'users', user.uid, 'debtTracker', 'main');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setDebtData(docSnap.data());
                } else {
                    const initial = {
                        installments: Array(6).fill(null).map((_, i) => ({ id: i + 1, isPaid: false }))
                    };
                    await setDoc(docRef, initial);
                    setDebtData(initial);
                }
            } catch (error) {
                console.error("Error fetching debt tracker:", error);
            }
            setLoading(false);
        };

        fetchDebt();
    }, [user]);

    const toggleInstallment = async (id) => {
        if (!user) return;

        try {
            const newInstallments = debtData.installments.map(item =>
                item.id === id ? { ...item, isPaid: !item.isPaid } : item
            );

            const newData = { ...debtData, installments: newInstallments };

            // Optimistic update
            setDebtData(newData);

            const docRef = doc(db, 'users', user.uid, 'debtTracker', 'main');
            await setDoc(docRef, newData, { merge: true });
        } catch (error) {
            console.error("Error toggling debt:", error);
            // Revert on error could be implemented here
        }
    };

    return { debtData, loading, toggleInstallment };
}
