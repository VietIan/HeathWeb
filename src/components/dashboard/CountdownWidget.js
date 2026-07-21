'use client';

import Link from 'next/link';
import { Timer, AlertTriangle } from 'lucide-react';
import { getCountdown, getUrgencyLevel } from '@/lib/utils/dateUtils';
import styles from './widgets.module.css';

export default function CountdownWidget({ tasks }) {
    // Find the nearest deadline that hasn't passed
    const upcomingTasks = tasks
        ?.filter(t => !t.completed && t.deadline)
        .map(t => ({
            ...t,
            countdown: getCountdown(t.deadline?.toDate?.() || t.deadline),
            urgency: getUrgencyLevel(t.deadline?.toDate?.() || t.deadline)
        }))
        .filter(t => !t.countdown.expired)
        .sort((a, b) => {
            const aTime = a.countdown.days * 24 + a.countdown.hours;
            const bTime = b.countdown.days * 24 + b.countdown.hours;
            return aTime - bTime;
        }) || [];

    const nearestTask = upcomingTasks[0];
    const criticalCount = upcomingTasks.filter(t => t.urgency === 'critical').length;

    return (
        <Link href="/dashboard/tasks" className={styles.widget}>
            <div className={styles.widgetHeader}>
                <span className={styles.widgetTitle}>Countdown</span>
                <div
                    className={styles.widgetIcon}
                    style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #FB923C 100%)' }}
                >
                    <Timer size={18} color="white" />
                </div>
            </div>

            {nearestTask ? (
                <>
                    <div className={styles.widgetValue}>
                        <span className={styles.countdownNumber}>{nearestTask.countdown.text}</span>
                    </div>
                    <p className={styles.taskTitle}>{nearestTask.title}</p>
                    {criticalCount > 0 && (
                        <div className={styles.urgentBadge}>
                            <AlertTriangle size={14} />
                            <span>{criticalCount} việc gấp</span>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className={styles.widgetValue}>
                        <span className={styles.textMuted}>Không có</span>
                    </div>
                    <p className={styles.widgetSubtext}>
                        Chưa có deadline sắp tới
                    </p>
                </>
            )}
        </Link>
    );
}
