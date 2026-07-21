import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export const uploadAvatar = async (userId, file) => {
    try {
        const avatarRef = ref(storage, `users/${userId}/avatar`);
        await uploadBytes(avatarRef, file);
        const url = await getDownloadURL(avatarRef);
        return { url, error: null };
    } catch (error) {
        return { url: null, error: error.message };
    }
};

export const uploadJournalImage = async (userId, journalId, file) => {
    try {
        const imageRef = ref(storage, `users/${userId}/journals/${journalId}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        return { url, error: null };
    } catch (error) {
        return { url: null, error: error.message };
    }
};

export const deleteJournalImage = async (userId, journalId) => {
    try {
        const imageRef = ref(storage, `users/${userId}/journals/${journalId}`);
        await deleteObject(imageRef);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};
