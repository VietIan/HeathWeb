export const MOODS = [
    { value: 'great', emoji: '😊', label: 'Tuyệt vời', color: '#4ADE80' },
    { value: 'good', emoji: '🙂', label: 'Tốt', color: '#60A5FA' },
    { value: 'okay', emoji: '😐', label: 'Bình thường', color: '#FBBF24' },
    { value: 'bad', emoji: '😔', label: 'Không tốt', color: '#FB923C' },
    { value: 'terrible', emoji: '😢', label: 'Tệ', color: '#F87171' }
];

export const getMoodByValue = (value) => {
    return MOODS.find(mood => mood.value === value) || MOODS[2];
};

export const getMoodEmoji = (value) => {
    const mood = getMoodByValue(value);
    return mood.emoji;
};

export const getMoodLabel = (value) => {
    const mood = getMoodByValue(value);
    return mood.label;
};

export const getMoodColor = (value) => {
    const mood = getMoodByValue(value);
    return mood.color;
};

export const calculateMoodStats = (moods) => {
    if (!moods || moods.length === 0) {
        return {
            total: 0,
            average: 'okay',
            distribution: {},
            streak: 0
        };
    }

    const moodScores = {
        great: 5,
        good: 4,
        okay: 3,
        bad: 2,
        terrible: 1
    };

    const scoreToMood = {
        5: 'great',
        4: 'good',
        3: 'okay',
        2: 'bad',
        1: 'terrible'
    };

    const distribution = {};
    let totalScore = 0;

    moods.forEach(m => {
        const mood = m.mood;
        distribution[mood] = (distribution[mood] || 0) + 1;
        totalScore += moodScores[mood] || 3;
    });

    const avgScore = Math.round(totalScore / moods.length);

    return {
        total: moods.length,
        average: scoreToMood[avgScore] || 'okay',
        distribution,
        streak: calculateMoodStreak(moods)
    };
};

export const calculateMoodStreak = (moods) => {
    if (!moods || moods.length === 0) return 0;

    const sortedMoods = [...moods].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedMoods.length; i++) {
        const moodDate = new Date(sortedMoods[i].date);
        moodDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);

        if (moodDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};
