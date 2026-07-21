import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    addDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { writeBatch } from 'firebase/firestore';
import { db } from './config';

const ZALO_OTP_TTL_MINUTES = 10;

// ============ USER OPERATIONS ============
export const createUserDocument = async (user) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            displayName: user.displayName || 'User',
            email: user.email,
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            settings: {
                theme: 'dark',
                notifications: true
            }
        });
    }
    return userRef;
};

export const getUserData = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
};

export const generateZaloOTP = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + ZALO_OTP_TTL_MINUTES * 60 * 1000);

    await setDoc(userRef, {
        zaloOTP: otp,
        zaloOTPExpiresAt: Timestamp.fromDate(expiresAt),
        updatedAt: serverTimestamp()
    }, { merge: true });

    return otp;
};

// ============ TASK OPERATIONS ============
export const addTask = async (userId, taskData) => {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    return await addDoc(tasksRef, {
        ...taskData,
        completed: false,
        createdAt: serverTimestamp()
    });
};

export const getTasks = async (userId) => {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateTask = async (userId, taskId, updates) => {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, updates);
};

export const deleteTask = async (userId, taskId) => {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskRef);
};

// ============ MOOD OPERATIONS ============
export const setMood = async (userId, date, moodData) => {
    const moodRef = doc(db, 'users', userId, 'moods', date);
    await setDoc(moodRef, {
        ...moodData,
        createdAt: serverTimestamp()
    });
};

export const getMood = async (userId, date) => {
    const moodRef = doc(db, 'users', userId, 'moods', date);
    const moodSnap = await getDoc(moodRef);
    return moodSnap.exists() ? moodSnap.data() : null;
};

export const getMoods = async (userId, startDate, endDate) => {
    const moodsRef = collection(db, 'users', userId, 'moods');
    const snapshot = await getDocs(moodsRef);
    return snapshot.docs.map(doc => ({ date: doc.id, ...doc.data() }));
};

// ============ JOURNAL OPERATIONS ============
export const addJournal = async (userId, journalData) => {
    const journalsRef = collection(db, 'users', userId, 'journals');
    return await addDoc(journalsRef, {
        ...journalData,
        createdAt: serverTimestamp()
    });
};

export const getJournals = async (userId) => {
    const journalsRef = collection(db, 'users', userId, 'journals');
    const q = query(journalsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteJournal = async (userId, journalId) => {
    const journalRef = doc(db, 'users', userId, 'journals', journalId);
    await deleteDoc(journalRef);
};

// ============ ATTENDANCE OPERATIONS ============
export const checkIn = async (userId, date) => {
    const attendanceRef = doc(db, 'users', userId, 'attendance', date);
    const attendanceSnap = await getDoc(attendanceRef);

    if (attendanceSnap.exists() && attendanceSnap.data().checkedIn) {
        return { success: false, message: 'Bạn đã check-in hôm nay rồi!', data: attendanceSnap.data() };
    }

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayRef = doc(db, 'users', userId, 'attendance', yesterdayStr);
    const yesterdaySnap = await getDoc(yesterdayRef);

    const streak = yesterdaySnap.exists() ? (yesterdaySnap.data().streak || 0) + 1 : 1;

    const now = new Date();
    await setDoc(attendanceRef, {
        checkedIn: true,
        checkInTime: serverTimestamp(),
        startTime: now.getTime(),
        endTime: null,
        pausedTime: 0,
        isPaused: false,
        pauseStartTime: null,
        totalHours: 0,
        streak
    });

    return { success: true, streak, startTime: now.getTime() };
};

export const pauseWork = async (userId, date) => {
    const attendanceRef = doc(db, 'users', userId, 'attendance', date);
    const attendanceSnap = await getDoc(attendanceRef);

    if (!attendanceSnap.exists()) return { success: false };

    const data = attendanceSnap.data();
    if (data.isPaused) return { success: false, message: 'Đã tạm dừng rồi!' };

    await updateDoc(attendanceRef, {
        isPaused: true,
        pauseStartTime: Date.now()
    });

    return { success: true };
};

export const resumeWork = async (userId, date) => {
    const attendanceRef = doc(db, 'users', userId, 'attendance', date);
    const attendanceSnap = await getDoc(attendanceRef);

    if (!attendanceSnap.exists()) return { success: false };

    const data = attendanceSnap.data();
    if (!data.isPaused) return { success: false, message: 'Chưa tạm dừng!' };

    const pausedDuration = Date.now() - (data.pauseStartTime || Date.now());
    const totalPausedTime = (data.pausedTime || 0) + pausedDuration;

    await updateDoc(attendanceRef, {
        isPaused: false,
        pauseStartTime: null,
        pausedTime: totalPausedTime
    });

    return { success: true };
};

export const endWork = async (userId, date) => {
    const attendanceRef = doc(db, 'users', userId, 'attendance', date);
    const attendanceSnap = await getDoc(attendanceRef);

    if (!attendanceSnap.exists()) return { success: false };

    const data = attendanceSnap.data();
    const endTime = Date.now();

    // Calculate total hours (excluding paused time)
    let pausedTime = data.pausedTime || 0;
    if (data.isPaused && data.pauseStartTime) {
        pausedTime += endTime - data.pauseStartTime;
    }

    const totalMs = endTime - data.startTime - pausedTime;
    const totalHours = Math.max(0, totalMs / (1000 * 60 * 60));

    await updateDoc(attendanceRef, {
        endTime,
        totalHours: Math.round(totalHours * 100) / 100,
        isPaused: false,
        pauseStartTime: null
    });

    return { success: true, totalHours };
};

export const updateAttendance = async (userId, date, updates) => {
    const attendanceRef = doc(db, 'users', userId, 'attendance', date);
    await updateDoc(attendanceRef, updates);
};

export const getAttendance = async (userId, date) => {
    const attendanceRef = doc(db, 'users', userId, 'attendance', date);
    const attendanceSnap = await getDoc(attendanceRef);
    return attendanceSnap.exists() ? attendanceSnap.data() : null;
};

export const getAttendanceHistory = async (userId) => {
    const attendanceRef = collection(db, 'users', userId, 'attendance');
    const snapshot = await getDocs(attendanceRef);
    return snapshot.docs.map(doc => ({ date: doc.id, ...doc.data() }));
};

// ============ EVENT/CALENDAR OPERATIONS ============
export const addEvent = async (userId, eventData) => {
    const eventsRef = collection(db, 'users', userId, 'events');
    return await addDoc(eventsRef, {
        ...eventData,
        isCountdown: eventData.isCountdown || false,
        createdAt: serverTimestamp()
    });
};

export const getEvents = async (userId) => {
    const eventsRef = collection(db, 'users', userId, 'events');
    const snapshot = await getDocs(eventsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteEvent = async (userId, eventId) => {
    const eventRef = doc(db, 'users', userId, 'events', eventId);
    await deleteDoc(eventRef);
};


// ============ SAFE DAY OPERATIONS ============
export const setSafeDay = async (userId, date, isSafe) => {
    const safeDayRef = doc(db, 'users', userId, 'safeDays', date);
    if (isSafe) {
        await setDoc(safeDayRef, {
            isSafe: true,
            createdAt: serverTimestamp()
        });
    } else {
        await deleteDoc(safeDayRef);
    }
};

export const getSafeDay = async (userId, date) => {
    const safeDayRef = doc(db, 'users', userId, 'safeDays', date);
    const safeDaySnap = await getDoc(safeDayRef);
    return safeDaySnap.exists() ? safeDaySnap.data() : null;
};

export const getSafeDays = async (userId) => {
    const safeDaysRef = collection(db, 'users', userId, 'safeDays');
    const snapshot = await getDocs(safeDaysRef);
    return snapshot.docs.map(doc => ({ date: doc.id, ...doc.data() }));
};

// ============ MINIMUM VIABLE DAY (MVD) OPERATIONS ============
export const setMVD = async (userId, date, task) => {
    const mvdRef = doc(db, 'users', userId, 'mvd', date);
    await setDoc(mvdRef, {
        task,
        completed: false,
        createdAt: serverTimestamp()
    });
};

export const getMVD = async (userId, date) => {
    const mvdRef = doc(db, 'users', userId, 'mvd', date);
    const mvdSnap = await getDoc(mvdRef);
    return mvdSnap.exists() ? { date, ...mvdSnap.data() } : null;
};

export const completeMVD = async (userId, date, completed) => {
    const mvdRef = doc(db, 'users', userId, 'mvd', date);
    await updateDoc(mvdRef, { completed });
};

// ============ RADICALS OPERATIONS ============
export const addRadicalsBatch = async (userId, radicalsList) => {
    const batch = writeBatch(db);
    const radicalsRef = collection(db, 'users', userId, 'radicals');
    
    radicalsList.forEach(radical => {
        const newDocRef = doc(radicalsRef); // auto-generate ID
        batch.set(newDocRef, {
            ...radical,
            createdAt: serverTimestamp()
        });
    });
    
    await batch.commit();
};

export const getMVDHistory = async (userId) => {
    const mvdRef = collection(db, 'users', userId, 'mvd');
    const snapshot = await getDocs(mvdRef);
    return snapshot.docs.map(doc => ({ date: doc.id, ...doc.data() }));
};

// ============ QUICK WORD OPERATIONS ============
export const addQuickWord = async (userId, wordData) => {
    const quickRef = collection(db, 'users', userId, 'quickWords');
    return await addDoc(quickRef, {
        word: wordData.word,
        meaning: wordData.meaning || '',
        type: wordData.type || 'word',
        date: wordData.date || new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
    });
};

export const getQuickWords = async (userId) => {
    const quickRef = collection(db, 'users', userId, 'quickWords');
    const q = query(quickRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteQuickWord = async (userId, wordId) => {
    const wordRef = doc(db, 'users', userId, 'quickWords', wordId);
    await deleteDoc(wordRef);
};

export const updateQuickWord = async (userId, wordId, updates) => {
    const wordRef = doc(db, 'users', userId, 'quickWords', wordId);
    await updateDoc(wordRef, updates);
};
