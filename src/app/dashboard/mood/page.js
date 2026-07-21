'use client';

import { useState } from 'react';
import { useMood } from '@/lib/hooks/useMood';
import { MOODS, getMoodByValue } from '@/lib/utils/moodUtils';
import { formatDate } from '@/lib/utils/dateUtils';
import { Flame, Check } from 'lucide-react';
import styles from './mood.module.css';

export default function MoodPage() {
    const { todayMood, moodHistory, streak, loading, saveMood } = useMood();
    const [selectedMood, setSelectedMood] = useState(todayMood?.mood || null);
    const [note, setNote] = useState(todayMood?.note || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!selectedMood) return;

        setSaving(true);
        const mood = getMoodByValue(selectedMood);
        await saveMood({
            mood: selectedMood,
            emoji: mood.emoji,
            note: note.trim()
        });
        setSaving(false);
    };

    // Get last 7 days of mood (for display)
    const recentMoods = moodHistory
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 7);

    return (
        <div className={styles.moodPage}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Tâm trạng hôm nay</h1>
                    <p>Bạn cảm thấy như thế nào?</p>
                </div>
                {streak > 0 && (
                    <div className={styles.streakBadge}>
                        <Flame size={18} />
                        <span>{streak} ngày liên tiếp</span>
                    </div>
                )}
            </header>

            {/* Mood Selector */}
            <section className={styles.moodSelector}>
                <div className={styles.moodOptions}>
                    {MOODS.map((mood) => (
                        <button
                            key={mood.value}
                            className={`${styles.moodOption} ${selectedMood === mood.value ? styles.selected : ''}`}
                            onClick={() => setSelectedMood(mood.value)}
                            style={{ '--mood-color': mood.color }}
                        >
                            <span className={styles.moodEmoji}>{mood.emoji}</span>
                            <span className={styles.moodLabel}>{mood.label}</span>
                            {selectedMood === mood.value && (
                                <div className={styles.checkMark}>
                                    <Check size={14} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className={styles.noteSection}>
                    <label>Ghi chú (tùy chọn)</label>
                    <textarea
                        className="glass-input"
                        placeholder="Hôm nay có gì đặc biệt không?"
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={!selectedMood || saving}
                    style={{ width: '100%' }}
                >
                    {saving ? 'Đang lưu...' : todayMood ? 'Cập nhật tâm trạng' : 'Lưu tâm trạng'}
                </button>

                {todayMood && (
                    <p className={styles.savedNote}>
                        ✓ Đã ghi nhận tâm trạng hôm nay lúc {formatDate(todayMood.createdAt?.toDate?.() || new Date(), 'HH:mm')}
                    </p>
                )}
            </section>

            {/* Mood History */}
            <section className={styles.historySection}>
                <h2>7 ngày gần đây</h2>
                {recentMoods.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Chưa có dữ liệu tâm trạng. Hãy bắt đầu ghi lại ngay!</p>
                    </div>
                ) : (
                    <div className={styles.historyGrid}>
                        {recentMoods.map((entry) => {
                            const mood = getMoodByValue(entry.mood);
                            return (
                                <div key={entry.date} className={styles.historyCard}>
                                    <span className={styles.historyDate}>
                                        {formatDate(entry.date, 'EEEE')}
                                    </span>
                                    <span className={styles.historyEmoji}>{mood.emoji}</span>
                                    <span
                                        className={styles.historyLabel}
                                        style={{ color: mood.color }}
                                    >
                                        {mood.label}
                                    </span>
                                    <span className={styles.historyDateNum}>
                                        {formatDate(entry.date, 'dd/MM')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Mood Stats */}
            {moodHistory.length > 0 && (
                <section className={styles.statsSection}>
                    <h2>Thống kê</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{moodHistory.length}</span>
                            <span className={styles.statLabel}>Ngày đã ghi</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{streak}</span>
                            <span className={styles.statLabel}>Streak hiện tại</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>
                                {getMoodByValue(
                                    moodHistory.reduce((acc, m) => {
                                        const scores = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
                                        return scores[m.mood] > scores[acc] ? m.mood : acc;
                                    }, 'terrible')
                                ).emoji}
                            </span>
                            <span className={styles.statLabel}>Tâm trạng hay gặp</span>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
