'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, X, Check } from 'lucide-react';
import styles from './EyeProtection.module.css';

const REMINDER_INTERVAL = 20 * 60 * 1000; // 20 minutes

export default function EyeProtection({ enabled = true }) {
    const [showReminder, setShowReminder] = useState(false);
    const [countdown, setCountdown] = useState(20);
    const [isResting, setIsResting] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        const interval = setInterval(() => {
            setShowReminder(true);
        }, REMINDER_INTERVAL);

        return () => clearInterval(interval);
    }, [enabled]);

    useEffect(() => {
        if (!isResting) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setIsResting(false);
                    setShowReminder(false);
                    return 20;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isResting]);

    const handleStartRest = () => {
        setIsResting(true);
        setCountdown(20);
    };

    const handleDismiss = () => {
        setShowReminder(false);
        setIsResting(false);
        setCountdown(20);
    };

    if (!showReminder) return null;

    return (
        <div className={styles.reminderToast}>
            <div className={styles.toastContent}>
                <div className={styles.iconWrapper}>
                    <Eye size={24} />
                </div>

                <div className={styles.textContent}>
                    {!isResting ? (
                        <>
                            <h4>👁️ Quy tắc 20-20-20</h4>
                            <p>Đã làm việc 20 phút. Nhìn xa 20 feet (6m) trong 20 giây!</p>
                        </>
                    ) : (
                        <>
                            <h4>Đang nghỉ mắt...</h4>
                            <p className={styles.countdownText}>
                                Nhìn xa trong <span className={styles.countdown}>{countdown}</span> giây
                            </p>
                        </>
                    )}
                </div>

                <div className={styles.actions}>
                    {!isResting ? (
                        <>
                            <button className={styles.startBtn} onClick={handleStartRest}>
                                <Check size={16} />
                                Bắt đầu
                            </button>
                            <button className={styles.dismissBtn} onClick={handleDismiss}>
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <div className={styles.progressRing}>
                            <svg viewBox="0 0 36 36">
                                <circle
                                    className={styles.progressBg}
                                    cx="18" cy="18" r="16"
                                    fill="none"
                                    strokeWidth="2"
                                />
                                <circle
                                    className={styles.progressFill}
                                    cx="18" cy="18" r="16"
                                    fill="none"
                                    strokeWidth="2"
                                    strokeDasharray={100}
                                    strokeDashoffset={100 - (countdown / 20) * 100}
                                />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
