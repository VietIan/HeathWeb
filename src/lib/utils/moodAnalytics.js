/**
 * Smart Mood Analytics - Phân tích tâm trạng thông minh
 */

import { MOODS } from './moodUtils';

// Mood score mapping
const MOOD_SCORES = {
    rad: 5,
    good: 4,
    meh: 3,
    bad: 2,
    awful: 1,
};

/**
 * Analyze mood patterns by day of week
 * @param {Array} moodHistory 
 * @returns {Object}
 */
export const analyzeMoodByDayOfWeek = (moodHistory) => {
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayStats = Array(7).fill(null).map(() => ({ total: 0, count: 0 }));

    moodHistory.forEach((entry) => {
        const date = new Date(entry.date);
        const dayIndex = date.getDay();
        const score = MOOD_SCORES[entry.mood] || 3;

        dayStats[dayIndex].total += score;
        dayStats[dayIndex].count++;
    });

    const results = dayStats.map((stat, index) => ({
        day: dayNames[index],
        dayIndex: index,
        avgScore: stat.count > 0 ? (stat.total / stat.count).toFixed(1) : 0,
        count: stat.count,
    }));

    // Find best and worst days
    const validDays = results.filter(d => d.count > 0);
    const bestDay = validDays.reduce((a, b) => parseFloat(a.avgScore) > parseFloat(b.avgScore) ? a : b, validDays[0]);
    const worstDay = validDays.reduce((a, b) => parseFloat(a.avgScore) < parseFloat(b.avgScore) ? a : b, validDays[0]);

    return {
        byDay: results,
        bestDay,
        worstDay,
    };
};

/**
 * Analyze mood trends over time
 * @param {Array} moodHistory 
 * @param {number} days - Number of days to analyze
 * @returns {Object}
 */
export const analyzeMoodTrend = (moodHistory, days = 30) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recentMoods = moodHistory
        .filter(m => new Date(m.date) >= cutoff)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (recentMoods.length < 3) {
        return { trend: 'insufficient', message: 'Chưa đủ dữ liệu' };
    }

    // Calculate moving average
    const scores = recentMoods.map(m => MOOD_SCORES[m.mood] || 3);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const diff = avgSecond - avgFirst;

    if (diff > 0.5) {
        return { trend: 'improving', message: '📈 Tâm trạng đang cải thiện!', diff: diff.toFixed(2) };
    } else if (diff < -0.5) {
        return { trend: 'declining', message: '📉 Tâm trạng có xu hướng giảm', diff: diff.toFixed(2) };
    }
    return { trend: 'stable', message: '➡️ Tâm trạng ổn định', diff: diff.toFixed(2) };
};

/**
 * Generate mood heatmap data for calendar view
 * @param {Array} moodHistory 
 * @param {number} year 
 * @param {number} month - 0-indexed
 * @returns {Object}
 */
export const generateMoodHeatmap = (moodHistory, year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const heatmapData = {};

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entry = moodHistory.find(m => m.date === dateStr);

        if (entry) {
            const moodInfo = MOODS.find(m => m.value === entry.mood);
            heatmapData[day] = {
                mood: entry.mood,
                score: MOOD_SCORES[entry.mood],
                color: moodInfo?.color || '#666',
                emoji: moodInfo?.emoji || '😐',
            };
        } else {
            heatmapData[day] = null;
        }
    }

    return heatmapData;
};

/**
 * Calculate mood-productivity correlation
 * @param {Array} moodHistory 
 * @param {Array} tasks 
 * @returns {Object}
 */
export const analyzeMoodProductivity = (moodHistory, tasks) => {
    const moodTaskMap = {};

    // Group tasks by completion date
    const tasksByDate = {};
    tasks.forEach(task => {
        if (task.completed && task.completedAt) {
            const date = new Date(task.completedAt.seconds * 1000).toISOString().split('T')[0];
            tasksByDate[date] = (tasksByDate[date] || 0) + 1;
        }
    });

    // Correlate with mood
    moodHistory.forEach(entry => {
        const mood = entry.mood;
        const tasksCompleted = tasksByDate[entry.date] || 0;

        if (!moodTaskMap[mood]) {
            moodTaskMap[mood] = { totalTasks: 0, count: 0 };
        }
        moodTaskMap[mood].totalTasks += tasksCompleted;
        moodTaskMap[mood].count++;
    });

    const results = Object.entries(moodTaskMap).map(([mood, data]) => ({
        mood,
        avgTasks: data.count > 0 ? (data.totalTasks / data.count).toFixed(1) : 0,
        moodInfo: MOODS.find(m => m.value === mood),
    }));

    return results.sort((a, b) => parseFloat(b.avgTasks) - parseFloat(a.avgTasks));
};

/**
 * Generate personalized insights
 * @param {Array} moodHistory 
 * @param {Array} tasks 
 * @param {Array} attendanceHistory 
 * @returns {Array}
 */
export const generateInsights = (moodHistory, tasks = [], attendanceHistory = []) => {
    const insights = [];

    // Day of week analysis
    const dayAnalysis = analyzeMoodByDayOfWeek(moodHistory);
    if (dayAnalysis.bestDay && dayAnalysis.worstDay && dayAnalysis.bestDay.day !== dayAnalysis.worstDay.day) {
        insights.push({
            type: 'pattern',
            icon: '📅',
            title: 'Xu hướng theo ngày',
            message: `Bạn thường vui nhất vào ${dayAnalysis.bestDay.day} và có xu hướng kém hơn vào ${dayAnalysis.worstDay.day}.`,
            tip: `Hãy lên kế hoạch công việc quan trọng vào ${dayAnalysis.bestDay.day}!`,
        });
    }

    // Trend analysis
    const trend = analyzeMoodTrend(moodHistory);
    if (trend.trend === 'improving') {
        insights.push({
            type: 'positive',
            icon: '🌟',
            title: 'Xu hướng tích cực',
            message: trend.message,
            tip: 'Tiếp tục những gì bạn đang làm!',
        });
    } else if (trend.trend === 'declining') {
        insights.push({
            type: 'warning',
            icon: '💙',
            title: 'Cần chú ý',
            message: trend.message,
            tip: 'Hãy dành thời gian cho bản thân và những hoạt động yêu thích.',
        });
    }

    // Productivity correlation
    if (tasks.length > 0 && moodHistory.length > 5) {
        const productivity = analyzeMoodProductivity(moodHistory, tasks);
        if (productivity.length > 0 && productivity[0].moodInfo) {
            insights.push({
                type: 'productivity',
                icon: '⚡',
                title: 'Mood & Năng suất',
                message: `Bạn làm việc hiệu quả nhất khi cảm thấy ${productivity[0].moodInfo.label} ${productivity[0].moodInfo.emoji}`,
                tip: 'Tìm cách duy trì tâm trạng tích cực để tăng năng suất!',
            });
        }
    }

    // Streak insights
    const moodStreak = calculateMoodStreak(moodHistory);
    if (moodStreak >= 7) {
        insights.push({
            type: 'achievement',
            icon: '🏆',
            title: 'Streak ấn tượng!',
            message: `Bạn đã ghi mood ${moodStreak} ngày liên tiếp!`,
            tip: 'Thói quen tuyệt vời! Hãy giữ vững nhé!',
        });
    }

    // Weekend vs weekday
    const weekendMoods = moodHistory.filter(m => {
        const day = new Date(m.date).getDay();
        return day === 0 || day === 6;
    });
    const weekdayMoods = moodHistory.filter(m => {
        const day = new Date(m.date).getDay();
        return day >= 1 && day <= 5;
    });

    if (weekendMoods.length >= 3 && weekdayMoods.length >= 5) {
        const weekendAvg = weekendMoods.reduce((a, m) => a + MOOD_SCORES[m.mood], 0) / weekendMoods.length;
        const weekdayAvg = weekdayMoods.reduce((a, m) => a + MOOD_SCORES[m.mood], 0) / weekdayMoods.length;

        if (weekendAvg - weekdayAvg > 0.5) {
            insights.push({
                type: 'lifestyle',
                icon: '🌴',
                title: 'Work-Life Balance',
                message: 'Bạn vui hơn vào cuối tuần so với ngày làm việc.',
                tip: 'Thử mang một chút "năng lượng cuối tuần" vào ngày thường xem sao!',
            });
        }
    }

    return insights;
};

/**
 * Calculate mood streak
 */
const calculateMoodStreak = (moodHistory) => {
    if (moodHistory.length === 0) return 0;

    const sorted = [...moodHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of sorted) {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        const diffDays = Math.round((currentDate - entryDate) / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
            streak++;
            currentDate = entryDate;
        } else {
            break;
        }
    }

    return streak;
};

export { MOOD_SCORES };
