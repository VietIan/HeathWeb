'use client';

import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import styles from './YearHeatmap.module.css';

const MOOD_COLORS = {
    happy: '#FCD34D',      // Yellow
    awesome: '#F97316',    // Orange
    normal: '#4ADE80',     // Green
    neutral: '#94A3B8',    // Gray
    sad: '#3B82F6',        // Blue
    bad: '#6366F1',        // Indigo
    angry: '#F87171',      // Red
    stressed: '#A855F7',   // Purple
};

const MOOD_LABELS = {
    happy: '😊 Vui vẻ',
    awesome: '🤩 Tuyệt vời',
    normal: '😐 Bình thường',
    neutral: '😶 Trung lập',
    sad: '😢 Buồn',
    bad: '😞 Tệ',
    angry: '😠 Tức giận',
    stressed: '😰 Căng thẳng',
};

const getDaysInYear = (year) => {
    const days = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    let current = new Date(startDate);
    while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
};

const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const getWeekNumber = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.floor((days + startOfYear.getDay()) / 7);
};

export default function YearHeatmap({ moodLogs = [], year = new Date().getFullYear(), onDayClick }) {
    const [tooltip, setTooltip] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    // Create a map of date -> mood
    const moodMap = useMemo(() => {
        const map = {};
        moodLogs.forEach(log => {
            const dateKey = typeof log.date === 'string'
                ? log.date.split('T')[0]
                : formatDate(new Date(log.date));
            map[dateKey] = log;
        });
        return map;
    }, [moodLogs]);

    // Generate all days grouped by week
    const weeks = useMemo(() => {
        const days = getDaysInYear(year);
        const weeksMap = {};

        days.forEach(day => {
            const weekNum = getWeekNumber(day);
            if (!weeksMap[weekNum]) {
                weeksMap[weekNum] = [];
            }
            weeksMap[weekNum].push(day);
        });

        return Object.values(weeksMap);
    }, [year]);

    const handleMouseEnter = (e, date, log) => {
        const rect = e.target.getBoundingClientRect();
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            date,
            log,
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const handleDayClick = (date, log) => {
        if (log) {
            setSelectedDay({ date, log });
            onDayClick?.({ date, log });
        }
    };

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayLabels = ['CN', '', 'T3', '', 'T5', '', 'T7'];

    return (
        <div className={styles.heatmapContainer}>
            <div className={styles.header}>
                <h3>📊 Mood Heatmap {year}</h3>
                <div className={styles.stats}>
                    <span>{moodLogs.length} ngày đã log</span>
                </div>
            </div>

            <div className={styles.heatmapWrapper}>
                {/* Day labels */}
                <div className={styles.dayLabels}>
                    {dayLabels.map((label, i) => (
                        <span key={i}>{label}</span>
                    ))}
                </div>

                <div className={styles.gridWrapper}>
                    {/* Month labels */}
                    <div className={styles.monthLabels}>
                        {monthLabels.map((month, i) => (
                            <span key={i} style={{ left: `${(i / 12) * 100}%` }}>{month}</span>
                        ))}
                    </div>

                    {/* Heatmap grid */}
                    <div className={styles.grid}>
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className={styles.week}>
                                {week.map((day) => {
                                    const dateKey = formatDate(day);
                                    const log = moodMap[dateKey];
                                    const color = log?.mood ? MOOD_COLORS[log.mood] : null;
                                    const dayOfWeek = day.getDay();

                                    return (
                                        <div
                                            key={dateKey}
                                            className={`${styles.day} ${log ? styles.hasLog : ''}`}
                                            style={{
                                                backgroundColor: color || 'rgba(255,255,255,0.03)',
                                                gridRow: dayOfWeek + 1,
                                            }}
                                            onMouseEnter={(e) => handleMouseEnter(e, day, log)}
                                            onMouseLeave={handleMouseLeave}
                                            onClick={() => handleDayClick(day, log)}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
                <span className={styles.legendLabel}>Ít</span>
                {Object.entries(MOOD_COLORS).map(([mood, color]) => (
                    <div
                        key={mood}
                        className={styles.legendItem}
                        style={{ backgroundColor: color }}
                        title={MOOD_LABELS[mood]}
                    />
                ))}
                <span className={styles.legendLabel}>Nhiều</span>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className={styles.tooltip}
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                    }}
                >
                    <strong>
                        {tooltip.date.toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        })}
                    </strong>
                    {tooltip.log ? (
                        <span>{MOOD_LABELS[tooltip.log.mood] || tooltip.log.mood}</span>
                    ) : (
                        <span className={styles.noLog}>Chưa log</span>
                    )}
                </div>
            )}

            {/* Day Detail Modal */}
            {selectedDay && (
                <div className={styles.modalOverlay} onClick={() => setSelectedDay(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setSelectedDay(null)}>
                            <X size={18} />
                        </button>
                        <h4>
                            {selectedDay.date.toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </h4>
                        <div className={styles.moodDisplay}>
                            <span
                                className={styles.moodBadge}
                                style={{ backgroundColor: MOOD_COLORS[selectedDay.log.mood] }}
                            >
                                {MOOD_LABELS[selectedDay.log.mood]}
                            </span>
                        </div>
                        {selectedDay.log.note && (
                            <p className={styles.noteText}>{selectedDay.log.note}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
