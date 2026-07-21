'use client';

import { useMemo } from 'react';
import { generateInsights, analyzeMoodByDayOfWeek } from '@/lib/utils/moodAnalytics';
import styles from './MoodInsights.module.css';

export default function MoodInsights({ moodHistory, tasks = [], attendanceHistory = [] }) {
    const insights = useMemo(() => {
        return generateInsights(moodHistory, tasks, attendanceHistory);
    }, [moodHistory, tasks, attendanceHistory]);

    const dayAnalysis = useMemo(() => {
        return analyzeMoodByDayOfWeek(moodHistory);
    }, [moodHistory]);

    if (insights.length === 0 && moodHistory.length < 5) {
        return (
            <div className={styles.insightsContainer}>
                <h3 className={styles.title}>🧠 Smart Insights</h3>
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📊</span>
                    <p>Ghi nhận mood mỗi ngày để nhận insights thông minh!</p>
                    <span className={styles.emptyHint}>Cần ít nhất 5 ngày dữ liệu</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.insightsContainer}>
            <h3 className={styles.title}>🧠 Smart Insights</h3>

            {/* Day of Week Chart */}
            <div className={styles.dayChart}>
                <h4>Mood theo ngày trong tuần</h4>
                <div className={styles.dayBars}>
                    {dayAnalysis.byDay.map((day) => {
                        const height = day.count > 0 ? (parseFloat(day.avgScore) / 5) * 100 : 0;
                        const isHighest = day.day === dayAnalysis.bestDay?.day;
                        const isLowest = day.day === dayAnalysis.worstDay?.day;

                        return (
                            <div key={day.dayIndex} className={styles.dayBar}>
                                <div className={styles.barWrapper}>
                                    <div
                                        className={`${styles.bar} ${isHighest ? styles.barBest : ''} ${isLowest ? styles.barWorst : ''}`}
                                        style={{ height: `${height}%` }}
                                    >
                                        {day.count > 0 && (
                                            <span className={styles.barValue}>{day.avgScore}</span>
                                        )}
                                    </div>
                                </div>
                                <span className={styles.dayLabel}>{day.day.slice(0, 2)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Insights Cards */}
            <div className={styles.insightsList}>
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className={`${styles.insightCard} ${styles[`insight${insight.type}`]}`}
                    >
                        <div className={styles.insightHeader}>
                            <span className={styles.insightIcon}>{insight.icon}</span>
                            <h4>{insight.title}</h4>
                        </div>
                        <p className={styles.insightMessage}>{insight.message}</p>
                        {insight.tip && (
                            <p className={styles.insightTip}>💡 {insight.tip}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
