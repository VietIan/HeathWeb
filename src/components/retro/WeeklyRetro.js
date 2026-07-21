'use client';

import { useState, useEffect } from 'react';
import { useMood } from '@/lib/hooks/useMood';
import { useTasks } from '@/lib/hooks/useTasks';
import { useAttendance } from '@/lib/hooks/useAttendance';
import { X, ChevronRight, ChevronLeft, Check, Download } from 'lucide-react';
import styles from './WeeklyRetro.module.css';

export default function WeeklyRetro({ isOpen, onClose }) {
    const { moodHistory } = useMood();
    const { tasks } = useTasks();
    const { history: attendanceHistory } = useAttendance();

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({
        good: '',
        bad: '',
        improve: '',
    });
    const [weekStats, setWeekStats] = useState(null);

    // Calculate weekly stats
    useEffect(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Mood this week
        const weekMoods = moodHistory.filter(m => new Date(m.date) >= weekAgo);
        const avgMood = weekMoods.length > 0
            ? weekMoods.reduce((sum, m) => sum + m.value, 0) / weekMoods.length
            : 0;

        // Tasks this week
        const weekTasks = tasks.filter(t => {
            const completedAt = t.completedAt ? new Date(t.completedAt) : null;
            return completedAt && completedAt >= weekAgo;
        });

        // Attendance this week
        const weekAttendance = attendanceHistory.filter(a => new Date(a.date) >= weekAgo);

        setWeekStats({
            moodDays: weekMoods.length,
            avgMood: avgMood.toFixed(1),
            tasksCompleted: weekTasks.length,
            attendanceDays: weekAttendance.length,
        });
    }, [moodHistory, tasks, attendanceHistory]);

    const steps = [
        {
            title: 'Tổng kết tuần',
            subtitle: 'Xem lại dữ liệu tuần qua',
            type: 'stats',
        },
        {
            title: 'Điều tốt ✅',
            subtitle: 'Tuần này bạn đã làm tốt điều gì?',
            field: 'good',
            placeholder: 'VD: Hoàn thành dự án đúng deadline, giữ được streak mood...',
        },
        {
            title: 'Cần cải thiện ❌',
            subtitle: 'Điều gì chưa tốt tuần này?',
            field: 'bad',
            placeholder: 'VD: Ngủ muộn, chưa tập thể dục, procrastinate nhiều...',
        },
        {
            title: 'Cải thiện 🎯',
            subtitle: 'Tuần sau bạn sẽ làm gì để tốt hơn?',
            field: 'improve',
            placeholder: 'VD: Đặt alarm 6h sáng, dành 30p tập thể dục mỗi ngày...',
        },
        {
            title: 'Hoàn thành! 🎉',
            subtitle: 'Summary Card của bạn',
            type: 'summary',
        },
    ];

    const getMoodEmoji = (value) => {
        if (value >= 4) return '😊';
        if (value >= 3) return '😐';
        if (value >= 2) return '😔';
        return '😢';
    };

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleSave = () => {
        // Could save to Firestore here
        onClose?.();
    };

    if (!isOpen) return null;

    const currentStep = steps[step];

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                {/* Progress */}
                <div className={styles.progress}>
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`${styles.progressDot} ${i <= step ? styles.progressActive : ''}`}
                        />
                    ))}
                </div>

                {/* Step Content */}
                <div className={styles.stepContent}>
                    <h2>{currentStep.title}</h2>
                    <p className={styles.subtitle}>{currentStep.subtitle}</p>

                    {currentStep.type === 'stats' && weekStats && (
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <span className={styles.statEmoji}>{getMoodEmoji(parseFloat(weekStats.avgMood))}</span>
                                <span className={styles.statValue}>{weekStats.avgMood}</span>
                                <span className={styles.statLabel}>Mood TB</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statEmoji}>📝</span>
                                <span className={styles.statValue}>{weekStats.moodDays}</span>
                                <span className={styles.statLabel}>Ngày ghi mood</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statEmoji}>✅</span>
                                <span className={styles.statValue}>{weekStats.tasksCompleted}</span>
                                <span className={styles.statLabel}>Tasks hoàn thành</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statEmoji}>📅</span>
                                <span className={styles.statValue}>{weekStats.attendanceDays}</span>
                                <span className={styles.statLabel}>Ngày check-in</span>
                            </div>
                        </div>
                    )}

                    {currentStep.field && (
                        <textarea
                            className={styles.textarea}
                            value={answers[currentStep.field]}
                            onChange={(e) => setAnswers({ ...answers, [currentStep.field]: e.target.value })}
                            placeholder={currentStep.placeholder}
                            rows={4}
                        />
                    )}

                    {currentStep.type === 'summary' && (
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryHeader}>
                                <span>📊 Weekly Retro</span>
                                <span className={styles.summaryDate}>
                                    {new Date().toLocaleDateString('vi-VN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>

                            <div className={styles.summarySection}>
                                <h4>✅ Điều tốt</h4>
                                <p>{answers.good || '(Chưa điền)'}</p>
                            </div>

                            <div className={styles.summarySection}>
                                <h4>❌ Cần cải thiện</h4>
                                <p>{answers.bad || '(Chưa điền)'}</p>
                            </div>

                            <div className={styles.summarySection}>
                                <h4>🎯 Mục tiêu tuần sau</h4>
                                <p>{answers.improve || '(Chưa điền)'}</p>
                            </div>

                            {weekStats && (
                                <div className={styles.summaryStats}>
                                    <span>{getMoodEmoji(parseFloat(weekStats.avgMood))} Mood: {weekStats.avgMood}</span>
                                    <span>✅ {weekStats.tasksCompleted} tasks</span>
                                    <span>📅 {weekStats.attendanceDays} ngày</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className={styles.navigation}>
                    {step > 0 && (
                        <button className={styles.prevBtn} onClick={handlePrev}>
                            <ChevronLeft size={18} />
                            Quay lại
                        </button>
                    )}

                    <div className={styles.spacer} />

                    {step < steps.length - 1 ? (
                        <button className={styles.nextBtn} onClick={handleNext}>
                            Tiếp theo
                            <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button className={styles.saveBtn} onClick={handleSave}>
                            <Check size={18} />
                            Lưu & Đóng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
