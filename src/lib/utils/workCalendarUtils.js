import { getLocalDateKey } from './dateUtils';

// Anchor date for alternating Saturday off: 2026-07-25
export const ANCHOR_OFF_SATURDAY = '2026-07-25';

/**
 * Checks if a given Saturday is an OFF Saturday based on 14-day cycle from 2026-07-25.
 */
export function isOffSaturday(dateInput) {
    const dateKey = getLocalDateKey(dateInput);
    if (!dateKey) return false;

    const [year, month, day] = dateKey.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (d.getDay() !== 6) return false; // Not a Saturday

    const [aY, aM, aD] = ANCHOR_OFF_SATURDAY.split('-').map(Number);
    const anchorDate = new Date(aY, aM - 1, aD);

    const diffMs = d.getTime() - anchorDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Every 14 days from anchor date is OFF
    const mod14 = ((diffDays % 14) + 14) % 14;
    return mod14 === 0;
}

/**
 * Classifies a date into a workday status based on priority hierarchy:
 * 1. Manual Override (work, off, leave, holiday)
 * 2. Custom Holiday / Leave
 * 3. Alternating Saturday Rule
 * 4. Sunday (Default OFF)
 * 5. Regular Workday (Mon-Fri, and working Saturdays)
 */
export function getWorkdayStatus(dateInput, overrides = {}, holidays = {}) {
    const dateKey = getLocalDateKey(dateInput);
    if (!dateKey) return { type: 'WORK', isMandatory: true, label: 'Đi làm' };

    // 1. Manual Overrides
    if (overrides[dateKey]) {
        const overrideVal = overrides[dateKey];
        if (overrideVal === 'work') return { type: 'OVERRIDE_WORK', isMandatory: true, label: 'Đi làm (Đã đè)' };
        if (overrideVal === 'off') return { type: 'OVERRIDE_OFF', isMandatory: false, label: 'Nghỉ (Đã đè)' };
        if (overrideVal === 'leave') return { type: 'LEAVE', isMandatory: false, label: 'Nghỉ phép' };
        if (overrideVal === 'holiday') return { type: 'HOLIDAY', isMandatory: false, label: 'Nghỉ lễ' };
    }

    // 2. Custom Holidays
    if (holidays[dateKey]) {
        return { type: 'HOLIDAY', isMandatory: false, label: holidays[dateKey].name || 'Nghỉ lễ' };
    }

    const [year, month, day] = dateKey.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat

    // 3. Sunday
    if (dayOfWeek === 0) {
        return { type: 'OFF_SUNDAY', isMandatory: false, label: 'Nghỉ Chủ Nhật' };
    }

    // 4. Saturday
    if (dayOfWeek === 6) {
        if (isOffSaturday(d)) {
            return { type: 'OFF_SATURDAY', isMandatory: false, label: 'Nghỉ T7 Xen Kẽ' };
        }
        return { type: 'WORK_SATURDAY', isMandatory: true, label: 'Đi Làm T7' };
    }

    // 5. Mon-Fri Regular Workday
    return { type: 'WORK_REGULAR', isMandatory: true, label: 'Đi làm' };
}

/**
 * Calculates Workday Streak considering mandatory workdays exclusively.
 * Off days do not break streak and do not increment streak.
 */
export function calculateWorkdayStreak(checkedInDatesSet, overrides = {}, startDateStr = '2025-12-01') {
    if (!checkedInDatesSet || checkedInDatesSet.size === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    const todayStr = getLocalDateKey(new Date());

    const [sY, sM, sD] = startDateStr.split('-').map(Number);
    const curr = new Date(sY, sM - 1, sD);
    const [tY, tM, tD] = todayStr.split('-').map(Number);
    const endDate = new Date(tY, tM - 1, tD);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    while (curr <= endDate) {
        const dateKey = getLocalDateKey(curr);
        const status = getWorkdayStatus(dateKey, overrides);

        if (status.isMandatory) {
            if (checkedInDatesSet.has(dateKey)) {
                tempStreak++;
                if (tempStreak > longestStreak) longestStreak = tempStreak;
            } else {
                // If it's today and not checked in yet, don't break streak from yesterday
                if (dateKey !== todayStr) {
                    tempStreak = 0;
                }
            }
        } else {
            // Non-mandatory day: check-in counts as overtime, does NOT break streak if missed
            // Streak stays as is
        }

        curr.setDate(curr.getDate() + 1);
    }

    currentStreak = tempStreak;

    return {
        currentStreak,
        longestStreak
    };
}
