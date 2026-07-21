/**
 * Holiday Themes - Trang trí theo ngày lễ
 */

// Vietnamese and International Holidays
export const HOLIDAYS = [
    // Tết Nguyên Đán (lunar dates handled separately)
    { id: 'tet', name: 'Tết Nguyên Đán', type: 'lunar', month: 1, day: 1, duration: 7 },

    // Solar holidays
    {
        id: 'valentine', name: 'Valentine', month: 2, day: 14, emoji: '💕',
        theme: { primary: '#FF6B9D', secondary: '#FFB6C1', accent: '#FF1493', effect: 'hearts' }
    },

    {
        id: 'women', name: "Ngày Quốc tế Phụ nữ", month: 3, day: 8, emoji: '🌷',
        theme: { primary: '#FF69B4', secondary: '#FFB6C1', accent: '#FF1493', effect: 'flowers' }
    },

    {
        id: 'april-fools', name: 'Cá tháng Tư', month: 4, day: 1, emoji: '🃏',
        theme: { primary: '#FFD700', secondary: '#FFA500', accent: '#FF6347', effect: 'confetti' }
    },

    {
        id: 'liberation', name: 'Ngày Giải phóng', month: 4, day: 30, emoji: '🇻🇳',
        theme: { primary: '#DA251D', secondary: '#FFCD00', accent: '#DA251D', effect: 'flags' }
    },

    {
        id: 'labor', name: 'Ngày Quốc tế Lao động', month: 5, day: 1, emoji: '✊',
        theme: { primary: '#FF4500', secondary: '#FFD700', accent: '#FF6347', effect: 'stars' }
    },

    {
        id: 'children', name: 'Ngày Quốc tế Thiếu nhi', month: 6, day: 1, emoji: '🎈',
        theme: { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D', effect: 'balloons' }
    },

    {
        id: 'vietnam-women', name: 'Ngày Phụ nữ Việt Nam', month: 10, day: 20, emoji: '💐',
        theme: { primary: '#E91E63', secondary: '#FCE4EC', accent: '#C2185B', effect: 'flowers' }
    },

    {
        id: 'halloween', name: 'Halloween', month: 10, day: 31, emoji: '🎃',
        theme: { primary: '#FF6B00', secondary: '#000000', accent: '#8B00FF', effect: 'pumpkins' }
    },

    {
        id: 'teachers', name: "Ngày Nhà giáo Việt Nam", month: 11, day: 20, emoji: '📚',
        theme: { primary: '#4A90D9', secondary: '#87CEEB', accent: '#1E90FF', effect: 'books' }
    },

    {
        id: 'national', name: 'Ngày Quốc khánh', month: 9, day: 2, emoji: '🇻🇳',
        theme: { primary: '#DA251D', secondary: '#FFCD00', accent: '#DA251D', effect: 'fireworks' }
    },

    {
        id: 'christmas-eve', name: 'Đêm Giáng sinh', month: 12, day: 24, emoji: '🎄',
        theme: { primary: '#228B22', secondary: '#FF0000', accent: '#FFD700', effect: 'snow' }
    },

    {
        id: 'christmas', name: 'Giáng sinh', month: 12, day: 25, emoji: '🎅',
        theme: { primary: '#228B22', secondary: '#FF0000', accent: '#FFFFFF', effect: 'snow' }
    },

    {
        id: 'new-year-eve', name: 'Giao thừa Tây', month: 12, day: 31, emoji: '🎆',
        theme: { primary: '#FFD700', secondary: '#C0C0C0', accent: '#FFA500', effect: 'fireworks' }
    },

    {
        id: 'new-year', name: 'Năm mới', month: 1, day: 1, emoji: '🎊',
        theme: { primary: '#FFD700', secondary: '#FF6B6B', accent: '#4ECDC4', effect: 'confetti' }
    },
];

// Tết Nguyên Đán Theme (special)
export const TET_THEME = {
    primary: '#DA251D',      // Đỏ
    secondary: '#FFD700',    // Vàng  
    accent: '#FF69B4',       // Hồng (hoa đào)
    background: '#8B0000',   // Đỏ đậm
    effect: 'tet',
    decorations: ['🧧', '🏮', '🎊', '🌸', '🎆', '🧨', '🍊', '🌺'],
};

// Trung Thu Theme
export const TRUNG_THU_THEME = {
    primary: '#FFD700',
    secondary: '#FFA500',
    accent: '#FFEC8B',
    background: '#1A1A2E',
    effect: 'lanterns',
    decorations: ['🏮', '🥮', '🐰', '🌕', '⭐'],
};

/**
 * Get current holiday if today is a holiday
 * @param {Date} date 
 * @returns {Object|null}
 */
export const getCurrentHoliday = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Check for holidays with duration (check days before too)
    for (const holiday of HOLIDAYS) {
        if (holiday.type === 'lunar') continue; // Handle lunar separately

        if (holiday.duration) {
            const holidayDate = new Date(date.getFullYear(), holiday.month - 1, holiday.day);
            const endDate = new Date(holidayDate);
            endDate.setDate(endDate.getDate() + holiday.duration);

            if (date >= holidayDate && date <= endDate) {
                return holiday;
            }
        } else if (holiday.month === month && holiday.day === day) {
            return holiday;
        }
    }

    return null;
};

/**
 * Get upcoming holidays
 * @param {Date} fromDate 
 * @param {number} count 
 * @returns {Array}
 */
export const getUpcomingHolidays = (fromDate, count = 5) => {
    const year = fromDate.getFullYear();
    const upcoming = [];

    for (const holiday of HOLIDAYS) {
        if (holiday.type === 'lunar') continue;

        let holidayDate = new Date(year, holiday.month - 1, holiday.day);
        if (holidayDate < fromDate) {
            holidayDate = new Date(year + 1, holiday.month - 1, holiday.day);
        }

        const daysUntil = Math.ceil((holidayDate - fromDate) / (1000 * 60 * 60 * 24));

        upcoming.push({
            ...holiday,
            date: holidayDate,
            daysUntil,
        });
    }

    return upcoming
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, count);
};

/**
 * Get theme colors for holiday
 * @param {Object} holiday 
 * @returns {Object}
 */
export const getHolidayTheme = (holiday) => {
    if (!holiday) return null;

    if (holiday.id === 'tet') return TET_THEME;
    if (holiday.id === 'mid-autumn') return TRUNG_THU_THEME;

    return holiday.theme || null;
};

/**
 * Check if date range includes Tết period
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @param {Object} lunarInfo - Lunar calendar info
 * @returns {boolean}
 */
export const isTetPeriod = (lunarInfo) => {
    const { lunarMonth, lunarDay } = lunarInfo;

    // Tết period: từ 23 tháng Chạp đến 15 tháng Giêng
    if (lunarMonth === 12 && lunarDay >= 23) return true;
    if (lunarMonth === 1 && lunarDay <= 15) return true;

    return false;
};

/**
 * Get seasonal theme based on month
 * @param {number} month - 1-12
 * @returns {Object}
 */
export const getSeasonalTheme = (month) => {
    // Mùa xuân: 2-4
    if (month >= 2 && month <= 4) {
        return {
            name: 'Xuân',
            emoji: '🌸',
            colors: { primary: '#FFB7C5', secondary: '#98FB98', accent: '#FFD700' },
        };
    }
    // Mùa hè: 5-7
    if (month >= 5 && month <= 7) {
        return {
            name: 'Hạ',
            emoji: '☀️',
            colors: { primary: '#FFD700', secondary: '#87CEEB', accent: '#FF6347' },
        };
    }
    // Mùa thu: 8-10
    if (month >= 8 && month <= 10) {
        return {
            name: 'Thu',
            emoji: '🍂',
            colors: { primary: '#DAA520', secondary: '#CD853F', accent: '#FF8C00' },
        };
    }
    // Mùa đông: 11-1
    return {
        name: 'Đông',
        emoji: '❄️',
        colors: { primary: '#87CEEB', secondary: '#B0E0E6', accent: '#4169E1' },
    };
};

export default HOLIDAYS;
