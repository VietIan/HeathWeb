'use client';

import Link from 'next/link';
import { Smile } from 'lucide-react';
import { getMoodByValue } from '@/lib/utils/moodUtils';
import styles from './widgets.module.css';

export default function MoodWidget({ todayMood, streak }) {
    const mood = todayMood ? getMoodByValue(todayMood.mood) : null;

    return (
        <Link href="/dashboard/mood" className={styles.widget}>
            <div className={styles.widgetHeader}>
                <span className={styles.widgetTitle}>Tâm trạng hôm nay</span>
                <div
                    className={styles.widgetIcon}
                    style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)' }}
                >
                    <Smile size={18} color="white" />
                </div>
            </div>

            {mood ? (
                <>
                    <div className={styles.widgetValue}>
                        <span className={styles.moodEmoji}>{mood.emoji}</span>
                        <span style={{ color: mood.color }}>{mood.label}</span>
                    </div>
                    {streak > 0 && (
                        <p className={styles.widgetSubtext}>
                            🔥 Streak: {streak} ngày liên tiếp
                        </p>
                    )}
                </>
            ) : (
                <>
                    <div className={styles.widgetValue}>
                        <span className={styles.moodEmoji}>❓</span>
                        <span className={styles.textMuted}>Chưa ghi nhận</span>
                    </div>
                    <p className={styles.widgetSubtext}>
                        Nhấn để ghi lại tâm trạng
                    </p>
                </>
            )}
        </Link>
    );
}
