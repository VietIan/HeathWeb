'use client';

import { useMemo } from 'react';
import { generateMoodHeatmap } from '@/lib/utils/moodAnalytics';
import styles from './MoodHeatmap.module.css';

export default function MoodHeatmap({ moodHistory, year, month }) {
    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const heatmapData = useMemo(() => {
        return generateMoodHeatmap(moodHistory, year, month);
    }, [moodHistory, year, month]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const weeks = [];
    let currentWeek = Array(firstDayOfMonth).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    const getColorIntensity = (score) => {
        if (!score) return 'transparent';
        const colors = {
            1: '#EF4444', // awful - red
            2: '#F97316', // bad - orange  
            3: '#EAB308', // meh - yellow
            4: '#22C55E', // good - green
            5: '#10B981', // rad - bright green
        };
        return colors[score] || '#666';
    };

    return (
        <div className={styles.heatmapContainer}>
            <h3 className={styles.title}>
                Mood Heatmap - {monthNames[month]} {year}
            </h3>

            <div className={styles.weekDays}>
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                    <span key={day} className={styles.weekDay}>{day}</span>
                ))}
            </div>

            <div className={styles.heatmap}>
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className={styles.week}>
                        {week.map((day, dayIndex) => {
                            const data = day ? heatmapData[day] : null;
                            return (
                                <div
                                    key={`${weekIndex}-${dayIndex}`}
                                    className={`${styles.day} ${day ? '' : styles.empty}`}
                                    style={{
                                        backgroundColor: data ? getColorIntensity(data.score) : 'rgba(255,255,255,0.05)'
                                    }}
                                    title={data ? `${day}/${month + 1}: ${data.emoji}` : ''}
                                >
                                    {day && (
                                        <>
                                            <span className={styles.dayNumber}>{day}</span>
                                            {data && <span className={styles.emoji}>{data.emoji}</span>}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className={styles.legend}>
                <span className={styles.legendLabel}>Sad</span>
                <div className={styles.legendColors}>
                    {[1, 2, 3, 4, 5].map(score => (
                        <div
                            key={score}
                            className={styles.legendColor}
                            style={{ backgroundColor: getColorIntensity(score) }}
                        />
                    ))}
                </div>
                <span className={styles.legendLabel}>Happy</span>
            </div>
        </div>
    );
}
