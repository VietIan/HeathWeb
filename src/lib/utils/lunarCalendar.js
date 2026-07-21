/**
 * Vietnamese Lunar Calendar Converter
 * Chuyển đổi ngày dương sang ngày âm lịch Việt Nam
 */

// Lunar calendar data tables
const LUNAR_MONTHS = [
  'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu',
  'Bảy', 'Tám', 'Chín', 'Mười', 'Một', 'Chạp'
];

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

const CHI_ANIMALS = {
  'Tý': '🐀', 'Sửu': '🐂', 'Dần': '🐅', 'Mão': '🐇',
  'Thìn': '🐉', 'Tỵ': '🐍', 'Ngọ': '🐴', 'Mùi': '🐑',
  'Thân': '🐵', 'Dậu': '🐓', 'Tuất': '🐕', 'Hợi': '🐷'
};

// Tiết khí (24 Solar Terms)
const TIET_KHI = [
  { name: 'Tiểu hàn', month: 1, day: 6 },
  { name: 'Đại hàn', month: 1, day: 20 },
  { name: 'Lập xuân', month: 2, day: 4 },
  { name: 'Vũ thủy', month: 2, day: 19 },
  { name: 'Kinh trập', month: 3, day: 6 },
  { name: 'Xuân phân', month: 3, day: 21 },
  { name: 'Thanh minh', month: 4, day: 5 },
  { name: 'Cốc vũ', month: 4, day: 20 },
  { name: 'Lập hạ', month: 5, day: 6 },
  { name: 'Tiểu mãn', month: 5, day: 21 },
  { name: 'Mang chủng', month: 6, day: 6 },
  { name: 'Hạ chí', month: 6, day: 21 },
  { name: 'Tiểu thử', month: 7, day: 7 },
  { name: 'Đại thử', month: 7, day: 23 },
  { name: 'Lập thu', month: 8, day: 8 },
  { name: 'Xử thử', month: 8, day: 23 },
  { name: 'Bạch lộ', month: 9, day: 8 },
  { name: 'Thu phân', month: 9, day: 23 },
  { name: 'Hàn lộ', month: 10, day: 8 },
  { name: 'Sương giáng', month: 10, day: 24 },
  { name: 'Lập đông', month: 11, day: 8 },
  { name: 'Tiểu tuyết', month: 11, day: 22 },
  { name: 'Đại tuyết', month: 12, day: 7 },
  { name: 'Đông chí', month: 12, day: 22 },
];

// Lunar calendar conversion tables (simplified algorithm)
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
];

// Helper functions
const lunarMonthDays = (y, m) => {
  return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29;
};

const lunarYearDays = (y) => {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
  }
  return sum + leapDays(y);
};

const leapMonth = (y) => {
  return LUNAR_INFO[y - 1900] & 0xf;
};

const leapDays = (y) => {
  if (leapMonth(y)) {
    return (LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29;
  }
  return 0;
};

/**
 * Convert solar date to lunar date
 * @param {Date} solarDate - Date object
 * @returns {Object} Lunar date info
 */
export const solarToLunar = (solarDate) => {
  const year = solarDate.getFullYear();
  const month = solarDate.getMonth() + 1;
  const day = solarDate.getDate();

  // Calculate days from base date (1900-01-31 = lunar 1900-01-01)
  const baseDate = new Date(1900, 0, 31);
  let offset = Math.floor((solarDate - baseDate) / 86400000);

  let lunarYear = 1900;
  let lunarMonth = 1;
  let lunarDay = 1;
  let isLeapMonth = false;

  // Find lunar year
  let temp = 0;
  while (lunarYear < 2100 && offset > 0) {
    temp = lunarYearDays(lunarYear);
    if (offset < temp) break;
    offset -= temp;
    lunarYear++;
  }

  // Find lunar month
  let leap = leapMonth(lunarYear);
  let isLeap = false;
  for (let i = 1; i <= 12; i++) {
    if (leap > 0 && i === (leap + 1) && !isLeap) {
      --i;
      isLeap = true;
      temp = leapDays(lunarYear);
    } else {
      temp = lunarMonthDays(lunarYear, i);
    }

    if (isLeap && i === (leap + 1)) {
      isLeap = false;
    }

    if (offset < temp) {
      lunarMonth = i;
      isLeapMonth = isLeap;
      break;
    }
    offset -= temp;
  }

  lunarDay = offset + 1;

  // Calculate Can Chi for year
  const canIndex = (lunarYear - 4) % 10;
  const chiIndex = (lunarYear - 4) % 12;
  const canChi = `${CAN[canIndex]} ${CHI[chiIndex]}`;
  const animal = CHI_ANIMALS[CHI[chiIndex]];

  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeapMonth,
    monthName: LUNAR_MONTHS[lunarMonth - 1],
    canChi,
    animal,
    can: CAN[canIndex],
    chi: CHI[chiIndex],
    // Formatted strings
    dayStr: lunarDay < 10 ? `0${lunarDay}` : `${lunarDay}`,
    monthStr: `Tháng ${LUNAR_MONTHS[lunarMonth - 1]}`,
    yearStr: `Năm ${canChi}`,
    fullStr: `${lunarDay}/${lunarMonth}${isLeapMonth ? ' nhuận' : ''} ${canChi}`,
    shortStr: `${lunarDay}/${lunarMonth}`,
  };
};

/**
 * Get tiết khí for a date
 * @param {Date} date 
 * @returns {string|null}
 */
export const getTietKhi = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const tiet = TIET_KHI.find(t => t.month === month && Math.abs(t.day - day) <= 1);
  return tiet ? tiet.name : null;
};

/**
 * Check if date is special lunar date
 * @param {Object} lunar - Lunar date object
 * @returns {Object|null}
 */
export const getSpecialLunarDate = (lunar) => {
  const { lunarMonth, lunarDay } = lunar;
  
  const specialDates = [
    { month: 1, day: 1, name: 'Mùng 1 Tết', emoji: '🧧' },
    { month: 1, day: 2, name: 'Mùng 2 Tết', emoji: '🧧' },
    { month: 1, day: 3, name: 'Mùng 3 Tết', emoji: '🧧' },
    { month: 1, day: 15, name: 'Tết Nguyên Tiêu', emoji: '🏮' },
    { month: 3, day: 3, name: 'Tết Hàn Thực', emoji: '🍡' },
    { month: 4, day: 15, name: 'Lễ Phật Đản', emoji: '🪷' },
    { month: 5, day: 5, name: 'Tết Đoan Ngọ', emoji: '🍃' },
    { month: 7, day: 15, name: 'Lễ Vu Lan', emoji: '🪷' },
    { month: 8, day: 15, name: 'Tết Trung Thu', emoji: '🥮' },
    { month: 9, day: 9, name: 'Tết Trùng Cửu', emoji: '🌿' },
    { month: 12, day: 23, name: 'Ông Táo về trời', emoji: '🔥' },
    { month: 12, day: 30, name: 'Giao thừa', emoji: '🎆' },
  ];

  // Mùng 1 hàng tháng
  if (lunarDay === 1) {
    return { name: 'Mùng 1', emoji: '🌑', type: 'new-moon' };
  }
  
  // Rằm (15)
  if (lunarDay === 15) {
    const special = specialDates.find(s => s.month === lunarMonth && s.day === 15);
    if (special) return { ...special, type: 'full-moon-special' };
    return { name: 'Rằm', emoji: '🌕', type: 'full-moon' };
  }

  return specialDates.find(s => s.month === lunarMonth && s.day === lunarDay) || null;
};

export { LUNAR_MONTHS, CAN, CHI, CHI_ANIMALS, TIET_KHI };
