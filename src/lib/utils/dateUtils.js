import { format, formatDistanceToNow, differenceInDays, differenceInHours, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, isAfter } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
    return format(new Date(date), formatStr, { locale: vi });
};

export const formatDateTime = (date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
};

export const getRelativeTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
};

export const getCountdown = (deadline) => {
    const now = new Date();
    const target = new Date(deadline);

    if (isBefore(target, now)) {
        return { expired: true, days: 0, hours: 0, text: 'Đã hết hạn' };
    }

    const days = differenceInDays(target, now);
    const hours = differenceInHours(target, now) % 24;

    let text = '';
    if (days > 0) {
        text = `${days} ngày ${hours} giờ`;
    } else if (hours > 0) {
        text = `${hours} giờ`;
    } else {
        text = 'Dưới 1 giờ';
    }

    return { expired: false, days, hours, text };
};

export const getUrgencyLevel = (deadline) => {
    const { days, expired } = getCountdown(deadline);

    if (expired) return 'expired';
    if (days < 1) return 'critical';
    if (days < 3) return 'warning';
    return 'normal';
};

export const getLocalDateKey = (dateInput = new Date()) => {
    if (!dateInput) return '';
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    return formatter.format(d);
};

export const getTodayString = () => {
    return getLocalDateKey(new Date());
};

export const getMonthDays = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
};

export const getDaysInWeek = (startDate) => {
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
};

export { isSameDay, isToday, addDays, subDays, startOfMonth, endOfMonth };
