'use client';

import { useState } from 'react';
import { useMood } from '@/lib/hooks/useMood';
import { useTasks } from '@/lib/hooks/useTasks';
import { useAttendance } from '@/lib/hooks/useAttendance';
import { MOODS, getMoodByValue, calculateMoodStats } from '@/lib/utils/moodUtils';
import { getProductivityScore } from '@/lib/utils/streakUtils';
import MoodHeatmap from '@/components/stats/MoodHeatmap';
import YearHeatmap from '@/components/stats/YearHeatmap';
import MoodInsights from '@/components/stats/MoodInsights';
import { TrendingUp, Heart, ClipboardCheck, ListTodo, Award, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './stats.module.css';

export default function StatsPage() {
    const { moodHistory, streak: moodStreak } = useMood();
    const { tasks } = useTasks();
    const { history: attendanceHistory, streak: attendanceStreak } = useAttendance();

    // Heatmap navigation
    const [heatmapDate, setHeatmapDate] = useState(new Date());
    const heatmapYear = heatmapDate.getFullYear();
    const heatmapMonth = heatmapDate.getMonth();

    const moodStats = calculateMoodStats(moodHistory);
    const productivityScore = getProductivityScore(tasks, attendanceHistory, moodHistory);

    // Calculate task stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get mood distribution for chart
    const moodDistribution = MOODS.map(mood => ({
        ...mood,
        count: moodStats.distribution[mood.value] || 0
    }));

    // Calculate attendance rate (last 30 days)
    const last30Days = 30;
    const attendanceRate = Math.round((attendanceHistory.length / last30Days) * 100);

    // Get score color and message
    const getScoreInfo = (score) => {
        if (score >= 80) return { color: '#4ADE80', message: 'Xuất sắc! 🌟', grade: 'A' };
        if (score >= 60) return { color: '#60A5FA', message: 'Tốt lắm! 👍', grade: 'B' };
        if (score >= 40) return { color: '#FBBF24', message: 'Cần cố gắng thêm! 💪', grade: 'C' };
        return { color: '#F87171', message: 'Hãy bắt đầu lại! 🚀', grade: 'D' };
    };

    const scoreInfo = getScoreInfo(productivityScore);

    const goToPrevMonth = () => {
        const prev = new Date(heatmapDate);
        prev.setMonth(prev.getMonth() - 1);
        setHeatmapDate(prev);
    };

    const goToNextMonth = () => {
        const next = new Date(heatmapDate);
        next.setMonth(next.getMonth() + 1);
        setHeatmapDate(next);
    };

    return (
        <div className={styles.statsPage}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Thống kê</h1>
                    <p>Tổng quan về sức khỏe tinh thần và năng suất của bạn</p>
                </div>
            </header>

            {/* Productivity Score */}
            <section className={styles.scoreSection}>
                <div className={styles.scoreCard}>
                    <div className={styles.scoreRing} style={{ '--score': productivityScore, '--color': scoreInfo.color }}>
                        <div className={styles.scoreInner}>
                            <span className={styles.scoreValue}>{productivityScore}</span>
                            <span className={styles.scoreLabel}>điểm</span>
                        </div>
                    </div>
                    <div className={styles.scoreInfo}>
                        <h2>Điểm năng suất</h2>
                        <span className={styles.scoreGrade} style={{ background: scoreInfo.color }}>
                            {scoreInfo.grade}
                        </span>
                        <p>{scoreInfo.message}</p>
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className={styles.quickStats}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #60A5FA, #A78BFA)' }}>
                        <Heart size={22} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{moodStreak}</span>
                        <span className={styles.statLabel}>Mood Streak</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FBBF24, #FB923C)' }}>
                        <Flame size={22} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{attendanceStreak}</span>
                        <span className={styles.statLabel}>Attendance Streak</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4ADE80, #22D3EE)' }}>
                        <ListTodo size={22} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{completionRate}%</span>
                        <span className={styles.statLabel}>Hoàn thành tasks</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #F87171, #FB7185)' }}>
                        <Award size={22} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{moodStats.total}</span>
                        <span className={styles.statLabel}>Ngày ghi mood</span>
                    </div>
                </div>
            </section>

            {/* Mood Heatmap with Navigation */}
            <section className={styles.heatmapSection}>
                <div className={styles.heatmapNav}>
                    <button className={styles.navBtn} onClick={goToPrevMonth}>
                        <ChevronLeft size={18} />
                    </button>
                    <button className={styles.navBtn} onClick={goToNextMonth}>
                        <ChevronRight size={18} />
                    </button>
                </div>
                <MoodHeatmap
                    moodHistory={moodHistory}
                    year={heatmapYear}
                    month={heatmapMonth}
                />
            </section>

            {/* Smart Insights */}
            <section className={styles.insightsSection}>
                <MoodInsights
                    moodHistory={moodHistory}
                    tasks={tasks}
                    attendanceHistory={attendanceHistory}
                />
            </section>

            {/* GitHub-style Year Heatmap */}
            <section className={styles.yearHeatmapSection}>
                <YearHeatmap moodLogs={moodHistory} year={new Date().getFullYear()} />
            </section>

            {/* Mood Distribution */}
            <section className={styles.chartSection}>
                <h2>Phân bố tâm trạng</h2>
                <div className={styles.moodChart}>
                    {moodDistribution.map((mood) => {
                        const percentage = moodStats.total > 0
                            ? Math.round((mood.count / moodStats.total) * 100)
                            : 0;
                        return (
                            <div key={mood.value} className={styles.moodBar}>
                                <div className={styles.moodBarHeader}>
                                    <span className={styles.moodEmoji}>{mood.emoji}</span>
                                    <span className={styles.moodName}>{mood.label}</span>
                                    <span className={styles.moodCount}>{mood.count}</span>
                                </div>
                                <div className={styles.barContainer}>
                                    <div
                                        className={styles.barFill}
                                        style={{
                                            width: `${percentage}%`,
                                            background: mood.color
                                        }}
                                    />
                                </div>
                                <span className={styles.moodPercent}>{percentage}%</span>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
