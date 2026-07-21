'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { differenceInDays, eachDayOfInterval, isWeekend, isSaturday, isSunday } from 'date-fns';
import styles from './widgets.module.css';

export default function EventCountdownWidget({ events }) {
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        // Find the nearest event marked as countdown
        const countdownEvents = events
            ?.filter(e => e.isCountdown && new Date(e.date) >= new Date().setHours(0, 0, 0, 0))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (countdownEvents && countdownEvents.length > 0) {
            const nearestEvent = countdownEvents[0];
            const targetDate = new Date(nearestEvent.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const daysRemaining = differenceInDays(targetDate, today);

            // Count weekends between now and target
            let saturdays = 0;
            let sundays = 0;

            if (daysRemaining > 0) {
                const days = eachDayOfInterval({ start: today, end: targetDate });
                days.forEach(day => {
                    if (isSaturday(day)) saturdays++;
                    if (isSunday(day)) sundays++;
                });
            }

            setCountdown({
                event: nearestEvent,
                daysRemaining,
                saturdays,
                sundays,
                workDays: daysRemaining - saturdays - sundays
            });
        } else {
            setCountdown(null);
        }
    }, [events]);

    return (
        <Link href="/dashboard/calendar" className={styles.widget}>
            <div className={styles.widgetHeader}>
                <span className={styles.widgetTitle}>Đếm ngày quan trọng</span>
                <div
                    className={styles.widgetIcon}
                    style={{ background: 'linear-gradient(135deg, #FF7A45 0%, #FF9F5A 100%)' }}
                >
                    <Calendar size={18} color="white" />
                </div>
            </div>

            {countdown ? (
                <>
                    <div className={styles.countdownMain}>
                        <span className={styles.countdownNumber}>{countdown.daysRemaining}</span>
                        <span className={styles.countdownLabel}>ngày</span>
                    </div>
                    <p className={styles.countdownEvent}>
                        {countdown.event.emoji} {countdown.event.title}
                    </p>
                    <div className={styles.weekendInfo}>
                        <span className={styles.weekendItem}>
                            📅 {countdown.workDays} ngày làm
                        </span>
                        <span className={styles.weekendItem}>
                            🛋️ {countdown.saturdays} T7, {countdown.sundays} CN
                        </span>
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.widgetValue}>
                        <span className={styles.textMuted}>Chưa có</span>
                    </div>
                    <p className={styles.widgetSubtext}>
                        Thêm sự kiện countdown trong Lịch
                    </p>
                </>
            )}
        </Link>
    );
}
