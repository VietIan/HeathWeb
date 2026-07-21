'use client';

import { useState } from 'react';
import { useJournal } from '@/lib/hooks/useJournal';
import { MOODS, getMoodByValue } from '@/lib/utils/moodUtils';
import { formatDate, getRelativeTime } from '@/lib/utils/dateUtils';
import { Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import styles from './journal.module.css';

export default function JournalPage() {
    const { journals, loading, createJournal, removeJournal } = useJournal();
    const [showForm, setShowForm] = useState(false);
    const [newEntry, setNewEntry] = useState({
        content: '',
        mood: 'okay',
        emoji: '📝'
    });
    const [saving, setSaving] = useState(false);

    const EMOJIS = ['📝', '💭', '🌟', '❤️', '🎯', '🌈', '☀️', '🌙', '🍀', '🔥'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEntry.content.trim()) return;

        setSaving(true);
        await createJournal(newEntry);
        setNewEntry({ content: '', mood: 'okay', emoji: '📝' });
        setShowForm(false);
        setSaving(false);
    };

    const handleDelete = async (journalId) => {
        if (confirm('Bạn có chắc muốn xóa nhật ký này?')) {
            await removeJournal(journalId);
        }
    };

    return (
        <div className={styles.journalPage}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Nhật ký</h1>
                    <p>Ghi lại suy nghĩ và cảm xúc của bạn</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    <Plus size={18} />
                    Viết nhật ký
                </button>
            </header>

            {/* New Entry Form */}
            {showForm && (
                <div className={styles.journalForm}>
                    <div className={styles.formHeader}>
                        <h3>Viết nhật ký mới</h3>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setShowForm(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.emojiSelector}>
                            <label>Chọn emoji</label>
                            <div className={styles.emojiList}>
                                {EMOJIS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        className={`${styles.emojiBtn} ${newEntry.emoji === emoji ? styles.selected : ''}`}
                                        onClick={() => setNewEntry({ ...newEntry, emoji })}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.moodSelector}>
                            <label>Tâm trạng</label>
                            <div className={styles.moodList}>
                                {MOODS.map((mood) => (
                                    <button
                                        key={mood.value}
                                        type="button"
                                        className={`${styles.moodBtn} ${newEntry.mood === mood.value ? styles.selected : ''}`}
                                        onClick={() => setNewEntry({ ...newEntry, mood: mood.value })}
                                        style={{ '--mood-color': mood.color }}
                                    >
                                        <span>{mood.emoji}</span>
                                        <span>{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.contentInput}>
                            <label>Nội dung</label>
                            <textarea
                                className="glass-input"
                                placeholder="Hôm nay bạn muốn chia sẻ điều gì?"
                                rows={6}
                                value={newEntry.content}
                                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => setShowForm(false)}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving || !newEntry.content.trim()}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu nhật ký'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Journal List */}
            <section className={styles.journalList}>
                {loading ? (
                    <div className={styles.loading}>Đang tải...</div>
                ) : journals.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>📔 Chưa có nhật ký nào</p>
                        <p>Hãy bắt đầu viết nhật ký đầu tiên của bạn!</p>
                    </div>
                ) : (
                    journals.map((journal) => {
                        const mood = getMoodByValue(journal.mood);
                        return (
                            <article key={journal.id} className={styles.journalCard}>
                                <div className={styles.journalHeader}>
                                    <div className={styles.journalMeta}>
                                        <span className={styles.journalEmoji}>{journal.emoji}</span>
                                        <span className={styles.journalDate}>
                                            {formatDate(journal.createdAt?.toDate?.() || new Date(), 'EEEE, dd/MM/yyyy')}
                                        </span>
                                        <span
                                            className={styles.journalMood}
                                            style={{ color: mood.color }}
                                        >
                                            {mood.emoji} {mood.label}
                                        </span>
                                    </div>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(journal.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className={styles.journalContent}>
                                    <p>{journal.content}</p>
                                </div>
                                {journal.imageUrl && (
                                    <div className={styles.journalImage}>
                                        <img src={journal.imageUrl} alt="Journal attachment" />
                                    </div>
                                )}
                                <div className={styles.journalFooter}>
                                    <span className={styles.relativeTime}>
                                        {getRelativeTime(journal.createdAt?.toDate?.() || new Date())}
                                    </span>
                                </div>
                            </article>
                        );
                    })
                )}
            </section>
        </div>
    );
}
