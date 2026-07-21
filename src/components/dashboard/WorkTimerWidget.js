'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Pause, Play, Square } from 'lucide-react';
import styles from './widgets.module.css';

export default function WorkTimerWidget({
    todayAttendance,
    isWorking,
    isPaused,
    onPause,
    onResume,
    onEnd,
    totalWorkHours,
    totalWorkDays
}) {
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [isAutoEnded, setIsAutoEnded] = useState(false);

    useEffect(() => {
        // Get startTime - fallback to checkInTime for old records
        const getStartTime = () => {
            if (todayAttendance?.startTime) {
                return todayAttendance.startTime;
            }
            // Fallback: use checkInTime if it exists
            if (todayAttendance?.checkInTime) {
                // checkInTime might be a Firestore Timestamp
                const checkIn = todayAttendance.checkInTime;
                if (checkIn?.toDate) {
                    return checkIn.toDate().getTime();
                }
                if (checkIn?.seconds) {
                    return checkIn.seconds * 1000;
                }
                return new Date(checkIn).getTime();
            }
            return null;
        };

        const startTime = getStartTime();

        if (!startTime || todayAttendance?.endTime) {
            if (todayAttendance?.endTime && todayAttendance?.totalHours) {
                const hours = Math.floor(todayAttendance.totalHours);
                const mins = Math.floor((todayAttendance.totalHours - hours) * 60);
                setElapsedTime(`${hours}h ${mins}m`);
            } else if (!todayAttendance?.checkedIn) {
                setElapsedTime('00:00:00');
            }
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            const pausedTime = todayAttendance?.pausedTime || 0;

            // If currently paused, don't add current pause duration
            let elapsed;
            if (isPaused && todayAttendance?.pauseStartTime) {
                const currentPauseDuration = now - todayAttendance.pauseStartTime;
                elapsed = now - startTime - pausedTime - currentPauseDuration;
            } else {
                elapsed = now - startTime - pausedTime;
            }

            // Check if it's past 5 PM (17:00) - auto end
            const currentHour = new Date().getHours();
            if (currentHour >= 17 && !isAutoEnded && isWorking) {
                setIsAutoEnded(true);
                onEnd?.();
                return;
            }

            // Ensure elapsed is positive
            elapsed = Math.max(0, elapsed);

            const hours = Math.floor(elapsed / (1000 * 60 * 60));
            const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

            setElapsedTime(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [todayAttendance, isPaused, isWorking, isAutoEnded, onEnd]);

    const handlePauseResume = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isPaused) {
            onResume?.();
        } else {
            onPause?.();
        }
    };

    const handleEnd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onEnd?.();
    };

    return (
        <Link href="/dashboard/attendance" className={styles.widget}>
            <div className={styles.widgetHeader}>
                <span className={styles.widgetTitle}>Giờ làm việc</span>
                <div
                    className={styles.widgetIcon}
                    style={{
                        background: isWorking
                            ? 'linear-gradient(135deg, #4ADE80 0%, #22D3EE 100%)'
                            : 'linear-gradient(135deg, #8B7E6E 0%, #C4B8A8 100%)'
                    }}
                >
                    <Clock size={18} color="white" />
                </div>
            </div>

            {isWorking ? (
                <>
                    <div className={styles.timerDisplay}>
                        <span className={`${styles.timerValue} ${isPaused ? styles.paused : ''}`}>
                            {elapsedTime}
                        </span>
                        {isPaused && <span className={styles.pausedLabel}>Tạm dừng</span>}
                    </div>

                    <div className={styles.timerControls}>
                        <button
                            className={`${styles.timerBtn} ${isPaused ? styles.resumeBtn : styles.pauseBtn}`}
                            onClick={handlePauseResume}
                        >
                            {isPaused ? <Play size={16} /> : <Pause size={16} />}
                            {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                        </button>
                        <button
                            className={`${styles.timerBtn} ${styles.stopBtn}`}
                            onClick={handleEnd}
                        >
                            <Square size={16} />
                            Kết thúc
                        </button>
                    </div>

                    <p className={styles.autoEndNote}>
                        ⏰ Tự động kết thúc lúc 17:00
                    </p>
                </>
            ) : todayAttendance?.endTime ? (
                <>
                    <div className={styles.widgetValue}>
                        <span className={styles.completedTime}>{elapsedTime}</span>
                    </div>
                    <p className={styles.widgetSubtext}>Đã hoàn thành hôm nay ✓</p>
                </>
            ) : (
                <>
                    <div className={styles.widgetValue}>
                        <span className={styles.textMuted}>Chưa bắt đầu</span>
                    </div>
                    <p className={styles.widgetSubtext}>Check-in để bắt đầu tính giờ</p>
                </>
            )}

            <div className={styles.workStats}>
                <span>📊 Tổng: {totalWorkHours}h / {totalWorkDays} ngày</span>
            </div>
        </Link>
    );
}
