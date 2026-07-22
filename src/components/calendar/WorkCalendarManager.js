'use client';

import { useState } from 'react';
import { useWorkCalendar } from '@/lib/hooks/useWorkCalendar';
import { getLocalDateKey } from '@/lib/utils/dateUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './WorkCalendarManager.module.css';

export default function WorkCalendarManager() {
    const { overrides, getDayInfo, setDayOverride } = useWorkCalendar();
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1)); // Default July 2026
    const [selectedDate, setSelectedDate] = useState(null);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const handleSelectDay = (dateStr) => {
        setSelectedDate(dateStr);
    };

    const handleSetStatus = async (status) => {
        if (!selectedDate) return;
        await setDayOverride(selectedDate, status);
        setSelectedDate(null);
    };

    const calendarDays = [];
    // Padding days before start of month
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push(null);
    }
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dateStr = getLocalDateKey(dateObj);
        const dayInfo = getDayInfo(dateStr);
        calendarDays.push({ d, dateStr, dayInfo });
    }

    return (
        <div className={styles.container}>
            <div className={styles.calendarHeader}>
                <div>
                    <h3>📅 Lịch Làm Việc & Quy Luật Thứ Bảy Xen Kẽ</h3>
                    <p className={styles.subtitle}>Gốc nghỉ T7: <strong>25/07/2026</strong>. Bấm ngày bất kỳ để đè trạng thái.</p>
                </div>
                <div className={styles.monthNav}>
                    <button onClick={prevMonth} className={styles.navBtn}>
                        <FontAwesomeIcon icon="chevron-left" />
                    </button>
                    <span className={styles.monthTitle}>Tháng {month + 1} / {year}</span>
                    <button onClick={nextMonth} className={styles.navBtn}>
                        <FontAwesomeIcon icon="chevron-right" />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className={styles.legendRow}>
                <div className={styles.legendItem}>
                    <span className={`${styles.dot} ${styles.workDot}`}></span> Đi làm
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.dot} ${styles.offDot}`}></span> Nghỉ (T7 xen kẽ / CN)
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.dot} ${styles.leaveDot}`}></span> Nghỉ phép
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.dot} ${styles.holidayDot}`}></span> Nghỉ lễ
                </div>
            </div>

            {/* Grid */}
            <div className={styles.gridHeader}>
                <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
            </div>

            <div className={styles.gridBody}>
                {calendarDays.map((item, idx) => {
                    if (!item) return <div key={`empty_${idx}`} className={styles.emptyCell} />;

                    const { d, dateStr, dayInfo } = item;
                    const isToday = dateStr === getLocalDateKey(new Date());
                    const isAnchorSat = dateStr === '2026-07-25';

                    return (
                        <div
                            key={dateStr}
                            className={`${styles.cell} ${styles[dayInfo.type]} ${isToday ? styles.todayCell : ''}`}
                            onClick={() => handleSelectDay(dateStr)}
                        >
                            <span className={styles.dayNum}>{d}</span>
                            {isAnchorSat && <span className={styles.anchorBadge}>Gốc</span>}
                            <span className={styles.statusText}>{dayInfo.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Override Action Dialog */}
            {selectedDate && (
                <div className={styles.overrideOverlay} onClick={() => setSelectedDate(null)}>
                    <div className={styles.overrideDialog} onClick={e => e.stopPropagation()}>
                        <h4>Đổi trạng thái ngày {selectedDate}</h4>
                        <p className={styles.dialogSub}>Hiện tại: <strong>{getDayInfo(selectedDate).label}</strong></p>

                        <div className={styles.dialogButtons}>
                            <button className={styles.workBtn} onClick={() => handleSetStatus('work')}>
                                💼 Đánh dấu: Đi Làm
                            </button>
                            <button className={styles.offBtn} onClick={() => handleSetStatus('off')}>
                                ☕ Đánh dấu: Nghỉ
                            </button>
                            <button className={styles.leaveBtn} onClick={() => handleSetStatus('leave')}>
                                🌴 Đánh dấu: Nghỉ Phép
                            </button>
                            <button className={styles.holidayBtn} onClick={() => handleSetStatus('holiday')}>
                                🎉 Đánh dấu: Nghỉ Lễ
                            </button>
                            <button className={styles.resetBtn} onClick={() => handleSetStatus('reset')}>
                                🔄 Đặt Lại Quy Luật Mặc Định
                            </button>
                        </div>
                        <button className={styles.cancelBtn} onClick={() => setSelectedDate(null)}>Hủy</button>
                    </div>
                </div>
            )}
        </div>
    );
}
