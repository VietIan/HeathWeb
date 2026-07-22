import {
    addDoc,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    runTransaction,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';
import { db } from './config';

const EMPTY_PLAN = {
    focusTaskIds: [],
    completedHabitIds: [],
    note: '',
};

const toMillis = (value) => {
    if (value?.toMillis) return value.toMillis();
    if (value?.seconds) return value.seconds * 1000;
    const parsed = new Date(value || 0).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
};

export const getDailyPlannerData = async (userId, dateKey) => {
    const planRef = doc(db, 'users', userId, 'dailyPlans', dateKey);
    const habitsRef = collection(db, 'users', userId, 'habits');
    const userRef = doc(db, 'users', userId);

    const [planSnap, habitsSnap, userSnap] = await Promise.all([
        getDoc(planRef),
        getDocs(habitsRef),
        getDoc(userRef),
    ]);

    const planData = planSnap.exists() ? planSnap.data() : {};
    const habits = habitsSnap.docs
        .map((habitDoc) => ({ id: habitDoc.id, ...habitDoc.data() }))
        .filter((habit) => habit.active !== false)
        .sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));

    const inbox = [...(userSnap.data()?.inbox || [])].sort((a, b) => (
        toMillis(b.addedAt || b.createdAt) - toMillis(a.addedAt || a.createdAt)
    ));

    return {
        plan: {
            ...EMPTY_PLAN,
            ...planData,
            focusTaskIds: planData.focusTaskIds || [],
            completedHabitIds: planData.completedHabitIds || [],
        },
        habits,
        inbox,
    };
};

export const updateDailyPlan = async (userId, dateKey, updates) => {
    const planRef = doc(db, 'users', userId, 'dailyPlans', dateKey);
    await setDoc(planRef, {
        ...updates,
        date: dateKey,
        updatedAt: serverTimestamp(),
    }, { merge: true });
};

export const addDailyHabit = async (userId, habitData) => {
    const habitsRef = collection(db, 'users', userId, 'habits');
    return addDoc(habitsRef, {
        name: habitData.name.trim(),
        emoji: habitData.emoji || '✓',
        color: habitData.color || '#FF9F5A',
        active: true,
        createdAt: serverTimestamp(),
    });
};

export const deleteDailyHabit = async (userId, habitId) => {
    const habitRef = doc(db, 'users', userId, 'habits', habitId);
    await deleteDoc(habitRef);
};

export const addPlannerInboxItem = async (userId, text) => {
    const userRef = doc(db, 'users', userId);
    const now = new Date().toISOString();
    const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: text.trim(),
        type: 'inbox',
        createdAt: now,
        addedAt: now,
    };

    await setDoc(userRef, {
        inbox: arrayUnion(item),
        updatedAt: serverTimestamp(),
    }, { merge: true });

    return item;
};

export const resolvePlannerInboxItem = async (userId, itemId, resolution = 'done') => {
    const userRef = doc(db, 'users', userId);

    await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const inbox = userData.inbox || [];
        const item = inbox.find((candidate) => candidate.id === itemId);
        if (!item) return;

        const archivedItem = {
            ...item,
            resolution,
            resolvedAt: new Date().toISOString(),
        };
        const archive = [archivedItem, ...(userData.inboxArchive || [])].slice(0, 100);

        transaction.set(userRef, {
            inbox: inbox.filter((candidate) => candidate.id !== itemId),
            inboxArchive: archive,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    });
};

