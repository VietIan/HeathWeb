// Achievement definitions with unlock conditions
export const ACHIEVEMENTS = [
    // Time-based
    {
        id: 'night_owl',
        name: 'Cú Đêm 🦉',
        description: 'Log mood hoặc hoàn thành task lúc 3h sáng',
        icon: '🦉',
        rarity: 'legendary',
        hidden: true,
        condition: (context) => {
            const hour = new Date().getHours();
            return hour >= 2 && hour <= 4;
        },
    },
    {
        id: 'early_bird',
        name: 'Early Bird 🌅',
        description: 'Check-in trước 7h sáng',
        icon: '🌅',
        rarity: 'rare',
        hidden: false,
        condition: (context) => {
            const hour = new Date().getHours();
            return hour >= 5 && hour <= 7 && context.event === 'checkin';
        },
    },

    // Task achievements
    {
        id: 'speed_demon',
        name: 'Thần Tốc ⚡',
        description: 'Hoàn thành task trong vòng 10 phút sau khi tạo',
        icon: '⚡',
        rarity: 'epic',
        hidden: true,
        condition: (context) => {
            if (context.event !== 'task_complete') return false;
            const createdAt = new Date(context.task.createdAt);
            const completedAt = new Date();
            const diffMinutes = (completedAt - createdAt) / (1000 * 60);
            return diffMinutes <= 10;
        },
    },
    {
        id: 'task_master',
        name: 'Task Master 🎯',
        description: 'Hoàn thành 100 tasks',
        icon: '🎯',
        rarity: 'epic',
        hidden: false,
        condition: (context) => context.totalTasksCompleted >= 100,
    },
    {
        id: 'first_task',
        name: 'Bước Đầu Tiên 👣',
        description: 'Hoàn thành task đầu tiên',
        icon: '👣',
        rarity: 'common',
        hidden: false,
        condition: (context) => context.totalTasksCompleted >= 1,
    },

    // Streak achievements
    {
        id: 'streak_3',
        name: 'Đà Tăng 🔥',
        description: '3 ngày check-in liên tiếp',
        icon: '🔥',
        rarity: 'common',
        hidden: false,
        condition: (context) => context.currentStreak >= 3,
    },
    {
        id: 'streak_7',
        name: 'Streak Master 💪',
        description: '7 ngày check-in liên tiếp',
        icon: '💪',
        rarity: 'rare',
        hidden: false,
        condition: (context) => context.currentStreak >= 7,
    },
    {
        id: 'streak_30',
        name: 'Bất Bại 👑',
        description: '30 ngày check-in liên tiếp',
        icon: '👑',
        rarity: 'legendary',
        hidden: false,
        condition: (context) => context.currentStreak >= 30,
    },

    // Focus achievements
    {
        id: 'first_pomodoro',
        name: 'Cà Chua Đầu 🍅',
        description: 'Hoàn thành Pomodoro đầu tiên',
        icon: '🍅',
        rarity: 'common',
        hidden: false,
        condition: (context) => context.totalPomodoros >= 1,
    },
    {
        id: 'zen_mode',
        name: 'Zen Mode 🧘',
        description: 'Hoàn thành 10 Pomodoro',
        icon: '🧘',
        rarity: 'rare',
        hidden: false,
        condition: (context) => context.totalPomodoros >= 10,
    },
    {
        id: 'focus_king',
        name: 'Focus King 🎧',
        description: 'Hoàn thành 100 Pomodoro',
        icon: '🎧',
        rarity: 'epic',
        hidden: false,
        condition: (context) => context.totalPomodoros >= 100,
    },

    // Mood achievements
    {
        id: 'mood_starter',
        name: 'Nhật Ký Đầu 📝',
        description: 'Log mood lần đầu tiên',
        icon: '📝',
        rarity: 'common',
        hidden: false,
        condition: (context) => context.totalMoodLogs >= 1,
    },
    {
        id: 'mood_master',
        name: 'Self-Aware 🔮',
        description: 'Log mood 30 lần',
        icon: '🔮',
        rarity: 'rare',
        hidden: false,
        condition: (context) => context.totalMoodLogs >= 30,
    },
    {
        id: 'happy_week',
        name: 'Tuần Vui Vẻ 😊',
        description: 'Có 7 ngày "happy" liên tiếp',
        icon: '😊',
        rarity: 'epic',
        hidden: true,
        condition: (context) => context.happyStreak >= 7,
    },

    // Productivity
    {
        id: 'productivity_90',
        name: 'Productivity King 📈',
        description: 'Đạt điểm năng suất 90+',
        icon: '📈',
        rarity: 'legendary',
        hidden: true,
        condition: (context) => context.productivityScore >= 90,
    },

    // Journal
    {
        id: 'journal_10',
        name: 'Nhà Văn 📖',
        description: 'Viết 10 bài nhật ký',
        icon: '📖',
        rarity: 'rare',
        hidden: false,
        condition: (context) => context.totalJournals >= 10,
    },
    {
        id: 'journal_30',
        name: 'Journal Pro ✍️',
        description: 'Viết 30 bài nhật ký',
        icon: '✍️',
        rarity: 'epic',
        hidden: false,
        condition: (context) => context.totalJournals >= 30,
    },

    // Special
    {
        id: 'weekend_warrior',
        name: 'Weekend Warrior 🏆',
        description: 'Hoàn thành 5 tasks vào cuối tuần',
        icon: '🏆',
        rarity: 'rare',
        hidden: true,
        condition: (context) => {
            const day = new Date().getDay();
            return (day === 0 || day === 6) && context.weekendTasksCompleted >= 5;
        },
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist 💯',
        description: 'Hoàn thành tất cả tasks trong 1 ngày không quá hạn',
        icon: '💯',
        rarity: 'legendary',
        hidden: true,
        condition: (context) => context.perfectDay === true,
    },
];

export const RARITY_COLORS = {
    common: '#94A3B8',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#FFD700',
};

export const RARITY_LABELS = {
    common: 'Thường',
    rare: 'Hiếm',
    epic: 'Sử thi',
    legendary: 'Huyền thoại',
};
