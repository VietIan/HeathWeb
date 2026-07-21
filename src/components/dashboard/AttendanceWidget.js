'use client';

import Link from 'next/link';
import { ClipboardCheck, Flame } from 'lucide-react';
import { getStreakMessage } from '@/lib/utils/streakUtils';
import styles from './widgets.module.css';

export default function AttendanceWidget({ hasCheckedIn, streak }) {
    const streakInfo = getStreakMessage(streak);

    return (
        <Link href="/dashboard/attendance" className={styles.widget}>
            <div className={styles.widgetHeader}>
                <span className={styles.widgetTitle}>Chấm công</span>
                <div
                    className={styles.widgetIcon}
                    style={{
                        background: hasCheckedIn
                            ? 'linear-gradient(135deg, #4ADE80 0%, #22D3EE 100%)'
                            : 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)'
                    }}
                >
                    <ClipboardCheck size={18} color="white" />
                </div>
            </div>

            <div className={styles.widgetValue}>
                {hasCheckedIn ? (
                    <>
                        <span className={styles.checkmark}>✅</span>
                        <span className={styles.textSuccess}>Đã check-in</span>
                    </>
                ) : (
                    <>
                        <span className={styles.pending}>⏳</span>
                        <span className={styles.textMuted}>Chưa check-in</span>
                    </>
                )}
            </div>

            {streak > 0 ? (
                <div className={styles.streakBadge}>
                    <Flame size={16} />
                    <span>{streak} ngày liên tiếp</span>
                    <span>{streakInfo.emoji}</span>
                </div>
            ) : (
                <p className={styles.widgetSubtext}>
                    {hasCheckedIn ? 'Streak bắt đầu!' : 'Nhấn để check-in'}
                </p>
            )}
        </Link>
    );
}
