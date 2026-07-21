export const calculateStreak = (attendanceHistory) => {
    if (!attendanceHistory || attendanceHistory.length === 0) return 0;

    const sortedDates = attendanceHistory
        .filter(a => a.checkedIn)
        .map(a => new Date(a.date))
        .sort((a, b) => b - a);

    if (sortedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user checked in today or yesterday
    const lastCheckIn = new Date(sortedDates[0]);
    lastCheckIn.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return 0; // Streak broken

    for (let i = 0; i < sortedDates.length; i++) {
        const checkDate = new Date(sortedDates[i]);
        checkDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i - diffDays);

        if (checkDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

export const getStreakMessage = (streak) => {
    if (streak === 0) return { message: 'Bắt đầu streak mới!', emoji: '🚀' };
    if (streak < 3) return { message: 'Khởi đầu tốt!', emoji: '⭐' };
    if (streak < 7) return { message: 'Tiếp tục phát huy!', emoji: '🔥' };
    if (streak < 14) return { message: 'Tuyệt vời! Một tuần rồi!', emoji: '💪' };
    if (streak < 30) return { message: 'Xuất sắc! Hai tuần liền!', emoji: '🏆' };
    if (streak < 60) return { message: 'Một tháng! Không thể tin được!', emoji: '👑' };
    return { message: 'Huyền thoại! Tiếp tục giữ vững!', emoji: '🌟' };
};

export const getProductivityScore = (tasks, attendance, moods) => {
    let score = 0;
    let maxScore = 0;

    // Task completion rate (40% of score)
    if (tasks && tasks.length > 0) {
        const completedTasks = tasks.filter(t => t.completed).length;
        score += (completedTasks / tasks.length) * 40;
    }
    maxScore += 40;

    // Attendance consistency (30% of score)
    if (attendance && attendance.length > 0) {
        const last7Days = 7;
        const checkedDays = Math.min(attendance.length, last7Days);
        score += (checkedDays / last7Days) * 30;
    }
    maxScore += 30;

    // Mood tracking (30% of score)
    if (moods && moods.length > 0) {
        const last7Days = 7;
        const trackedDays = Math.min(moods.length, last7Days);
        const avgMood = moods.reduce((sum, m) => {
            const scores = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
            return sum + (scores[m.mood] || 3);
        }, 0) / moods.length;

        score += (trackedDays / last7Days) * 15; // Consistency
        score += (avgMood / 5) * 15; // Mood quality
    }
    maxScore += 30;

    return Math.round((score / maxScore) * 100);
};
