'use client';

import { useState } from 'react';
import { useAttendance } from '@/lib/hooks/useAttendance';
import { formatDate } from '@/lib/utils/dateUtils';
import { ClipboardCheck, Flame, Calendar, Trophy, Clock } from 'lucide-react';
import styles from './attendance.module.css';

export default function AttendancePage() {
    const {
        todayAttendance,
        history,
        streak,
        streakInfo,
        hasCheckedInToday,
        loading,
        performCheckIn,
        backfillCheckIn
    } = useAttendance();
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState('');
    const [backfillDate, setBackfillDate] = useState('');
    const [backfilling, setBackfilling] = useState(false);

    const handleCheckIn = async () => {
        setChecking(true);
        const result = await performCheckIn();
        setMessage(result.success
            ? `✅ Check-in thành công! Streak: ${result.streak} ngày`
            : result.message
        );
        setChecking(false);

        setTimeout(() => setMessage(''), 3000);
    };

    const handleBackfill = async (e) => {
        e.preventDefault();
        if (!backfillDate) return;

        setBackfilling(true);
        const result = await backfillCheckIn(backfillDate);
        setMessage(result.success
            ? `✅ Check-in bù thành công cho ngày ${backfillDate}!`
            : result.message
        );
        setBackfilling(false);
        if (result.success) setBackfillDate('');

        setTimeout(() => setMessage(''), 5000);
    };

    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();

    const checkedDates = new Set(
        history.filter(h => h.checkedIn).map(h => h.date)
    );

    const totalCheckIns = history.filter(h => h.checkedIn).length;
    const thisMonthCheckIns = history.filter(h => {
        const date = new Date(h.date);
        const now = new Date();
        return h.checkedIn &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
    }).length;

    return (
        <div className={styles.attendancePage}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Chấm công</h1>
                    <p>Theo dõi sự kiên định của bạn mỗi ngày</p>
                </div>
            </header>

            <section className={styles.checkInSection}>
                <div className={styles.checkInCard}>
                    <div className={styles.checkInIcon}>
                        <ClipboardCheck size={48} />
                    </div>

                    <h2>{formatDate(new Date(), 'EEEE, dd MMMM yyyy')}</h2>

                    {hasCheckedInToday ? (
                        <div className={styles.checkedIn}>
                            <span className={styles.checkmark}>✅</span>
                            <p>Bạn đã check-in hôm nay!</p>
                            {todayAttendance?.checkInTime && (
                                <span className={styles.checkInTime}>
                                    <Clock size={14} />
                                    {formatDate(todayAttendance.checkInTime.toDate?.() || new Date(), 'HH:mm')}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className={styles.notCheckedIn}>
                            <p>Bạn chưa check-in hôm nay</p>
                            <button
                                className={`btn btn-success ${styles.checkInBtn}`}
                                onClick={handleCheckIn}
                                disabled={checking}
                            >
                                {checking ? 'Đang xử lý...' : '🎯 Check-in ngay'}
                            </button>
                        </div>
                    )}

                    {message && (
                        <div className={styles.message}>
                            {message}
                        </div>
                    )}

                    {streak > 0 && (
                        <div className={styles.streakDisplay}>
                            <Flame className={styles.flameIcon} size={24} />
                            <div className={styles.streakInfo}>
                                <span className={styles.streakNumber}>{streak}</span>
                                <span className={styles.streakLabel}>ngày liên tiếp</span>
                            </div>
                            <span className={styles.streakEmoji}>{streakInfo.emoji}</span>
                        </div>
                    )}

                    <p className={styles.streakMessage}>{streakInfo.message}</p>
                </div>
            </section>

            <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <Trophy className={styles.statIcon} />
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{streak}</span>
                            <span className={styles.statLabel}>Streak hiện tại</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <Calendar className={styles.statIcon} />
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{thisMonthCheckIns}</span>
                            <span className={styles.statLabel}>Check-in tháng này</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <ClipboardCheck className={styles.statIcon} />
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{totalCheckIns}</span>
                            <span className={styles.statLabel}>Tổng check-in</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.backfillSection}>
                <div className={styles.backfillCard}>
                    <h3>🎯 Check-in bù</h3>
                    <p>Quên check-in hôm nào đó? Bạn có thể bổ sung tại đây.</p>
                    <form onSubmit={handleBackfill} className={styles.backfillForm}>
                        <input
                            type="date"
                            value={backfillDate}
                            onChange={(e) => setBackfillDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className={styles.dateInput}
                            required
                        />
                        <button
                            type="submit"
                            className={`btn btn-primary ${styles.backfillBtn}`}
                            disabled={backfilling || !backfillDate}
                        >
                            {backfilling ? 'Đang xử lý...' : 'Bổ sung'}
                        </button>
                    </form>
                </div>
            </section>

            <section className={styles.calendarSection}>
                <h2>30 ngày gần đây</h2>
                <div className={styles.calendarGrid}>
                    {last30Days.map((date) => {
                        const isToday = date === new Date().toISOString().split('T')[0];
                        const isChecked = checkedDates.has(date);

                        return (
                            <div
                                key={date}
                                className={`${styles.calendarDay} ${isChecked ? styles.checked : ''} ${isToday ? styles.today : ''}`}
                            >
                                <span className={styles.dayNum}>
                                    {formatDate(date, 'd')}
                                </span>
                                {isChecked && <span className={styles.dayCheck}>✓</span>}
                            </div>
                        );
                    })}
                </div>
                <div className={styles.calendarLegend}>
                    <div className={styles.legendItem}>
                        <div className={`${styles.legendDot} ${styles.checked}`}></div>
                        <span>Đã check-in</span>
                    </div>
                    <div className={styles.legendItem}>
                        <div className={`${styles.legendDot} ${styles.today}`}></div>
                        <span>Hôm nay</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
