import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './config';
import { createUserDocument } from './firestore';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await createUserDocument(result.user);
        return { user: result.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

export const signUpWithEmail = async (email, password, displayName) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
        await createUserDocument(result.user);
        return { user: result.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};
