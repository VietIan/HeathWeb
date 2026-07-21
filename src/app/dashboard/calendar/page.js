'use client';

import { useState, useEffect } from 'react';
import { useCalendar } from '@/lib/hooks/useCalendar';
import { getMonthDays, isSameDay, isToday, formatDate } from '@/lib/utils/dateUtils';
import { solarToLunar, getSpecialLunarDate, getTietKhi } from '@/lib/utils/lunarCalendar';
import { getCurrentHoliday, getUpcomingHolidays, isTetPeriod, TET_THEME } from '@/lib/utils/holidayThemes';
import FestiveEffects from '@/components/effects/FestiveEffects';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Moon } from 'lucide-react';
import styles from './calendar.module.css';

const EVENT_TYPES = [
    { value: 'birthday', label: 'Sinh nhật', color: '#F87171', emoji: '🎂' },
    { value: 'goal', label: 'Mục tiêu', color: '#4ADE80', emoji: '🎯' },
    { value: 'event', label: 'Sự kiện', color: '#60A5FA', emoji: '📅' },
    { value: 'reminder', label: 'Nhắc nhở', color: '#FBBF24', emoji: '⏰' },
];

export default function CalendarPage() {
    const { events, selectedDate, setSelectedDate, createEvent, removeEvent } = useCalendar();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [showLunar, setShowLunar] = useState(true);
    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'event',
        date: '',
        isCountdown: false
    });

    const days = getMonthDays(currentMonth);
    const firstDayOfWeek = days[0].getDay();
    const paddingDays = Array(firstDayOfWeek).fill(null);

    // Check for current holiday and effects
    const today = new Date();
    const todayLunar = solarToLunar(today);
    const currentHoliday = getCurrentHoliday(today);
    const isTet = isTetPeriod(todayLunar);
    const upcomingHolidays = getUpcomingHolidays(today, 3);

    // Determine festive effect
    const getEffect = () => {
        if (isTet) return 'tet';
        if (currentHoliday?.theme?.effect) return currentHoliday.theme.effect;
        return null;
    };

    const goToPrevMonth = () => {
        const prev = new Date(currentMonth);
        prev.setMonth(prev.getMonth() - 1);
        setCurrentMonth(prev);
    };

    const goToNextMonth = () => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + 1);
        setCurrentMonth(next);
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
    };

    const getEventsForDay = (day) => {
        const dateStr = day.toISOString().split('T')[0];
        return events.filter(e => e.date === dateStr);
    };

    const handleDayClick = (day) => {
        setSelectedDate(day);
    };

    const handleAddEvent = () => {
        setNewEvent({
            title: '',
            type: 'event',
            date: selectedDate.toISOString().split('T')[0],
            isCountdown: false
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEvent.title.trim()) return;

        const eventType = EVENT_TYPES.find(t => t.value === newEvent.type);
        await createEvent({
            ...newEvent,
            color: eventType.color,
            emoji: eventType.emoji,
            isCountdown: newEvent.isCountdown
        });
        setShowModal(false);
        setNewEvent({ title: '', type: 'event', date: '', isCountdown: false });
    };

    const selectedDateEvents = events.filter(
        e => e.date === selectedDate.toISOString().split('T')[0]
    );

    // Get lunar info for selected date
    const selectedLunar = solarToLunar(selectedDate);
    const selectedSpecial = getSpecialLunarDate(selectedLunar);
    const selectedTietKhi = getTietKhi(selectedDate);

    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    return (
        <div className={styles.calendarPage}>
            {/* Festive Effects */}
            <FestiveEffects effect={getEffect()} intensity={0.5} />

            <header className={styles.pageHeader}>
                <div>
                    <h1>Lịch {isTet && '🧧'}</h1>
                    <p>Theo dõi các sự kiện và ngày quan trọng</p>
                </div>
                <button
                    className={`${styles.lunarToggle} ${showLunar ? styles.lunarActive : ''}`}
                    onClick={() => setShowLunar(!showLunar)}
                >
                    <Moon size={16} />
                    Âm lịch
                </button>
            </header>

            {/* Upcoming Holidays */}
            {upcomingHolidays.length > 0 && (
                <div className={styles.upcomingHolidays}>
                    <h4>📅 Sắp tới</h4>
                    <div className={styles.holidaysList}>
                        {upcomingHolidays.map((holiday, i) => (
                            <div key={i} className={styles.holidayChip}>
                                <span>{holiday.emoji}</span>
                                <span>{holiday.name}</span>
                                <span className={styles.daysUntil}>
                                    {holiday.daysUntil === 0 ? 'Hôm nay!' : `${holiday.daysUntil} ngày`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.calendarContainer}>
                {/* Calendar */}
                <div className={styles.calendar}>
                    <div className={styles.calendarHeader}>
                        <button className={styles.navBtn} onClick={goToPrevMonth}>
                            <ChevronLeft size={20} />
                        </button>
                        <div className={styles.monthInfo}>
                            <h2>{formatDate(currentMonth, 'MMMM yyyy')}</h2>
                            {showLunar && (
                                <span className={styles.lunarMonth}>
                                    {solarToLunar(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15)).yearStr}
                                </span>
                            )}
                        </div>
                        <button className={styles.navBtn} onClick={goToNextMonth}>
                            <ChevronRight size={20} />
                        </button>
                        <button className={styles.todayBtn} onClick={goToToday}>
                            Hôm nay
                        </button>
                    </div>

                    <div className={styles.weekDays}>
                        {weekDays.map(day => (
                            <div key={day} className={styles.weekDay}>{day}</div>
                        ))}
                    </div>

                    <div className={styles.daysGrid}>
                        {paddingDays.map((_, i) => (
                            <div key={`pad-${i}`} className={styles.dayEmpty}></div>
                        ))}
                        {days.map((day) => {
                            const dayEvents = getEventsForDay(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);
                            const lunar = solarToLunar(day);
                            const specialLunar = getSpecialLunarDate(lunar);

                            return (
                                <button
                                    key={day.toISOString()}
                                    className={`${styles.day} ${isSelected ? styles.selected : ''} ${isTodayDate ? styles.today : ''} ${specialLunar ? styles.specialDay : ''}`}
                                    onClick={() => handleDayClick(day)}
                                >
                                    <span className={styles.dayNumber}>{day.getDate()}</span>
                                    {showLunar && (
                                        <span className={`${styles.lunarDay} ${specialLunar ? styles.lunarSpecial : ''}`}>
                                            {specialLunar ? specialLunar.emoji : lunar.lunarDay}
                                        </span>
                                    )}
                                    {dayEvents.length > 0 && (
                                        <div className={styles.eventDots}>
                                            {dayEvents.slice(0, 3).map((event, i) => (
                                                <span
                                                    key={i}
                                                    className={styles.eventDot}
                                                    style={{ background: event.color }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Day Panel */}
                <div className={styles.dayPanel}>
                    <div className={styles.dayPanelHeader}>
                        <div>
                            <h3>{formatDate(selectedDate, 'EEEE, dd MMMM')}</h3>
                            {showLunar && (
                                <div className={styles.lunarInfo}>
                                    <span className={styles.lunarDate}>
                                        🌙 {selectedLunar.fullStr}
                                    </span>
                                    {selectedSpecial && (
                                        <span className={styles.lunarSpecialBadge}>
                                            {selectedSpecial.emoji} {selectedSpecial.name}
                                        </span>
                                    )}
                                    {selectedTietKhi && (
                                        <span className={styles.tietKhiBadge}>
                                            🌿 {selectedTietKhi}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={handleAddEvent}>
                            <Plus size={16} />
                            Thêm sự kiện
                        </button>
                    </div>

                    <div className={styles.eventList}>
                        {selectedDateEvents.length === 0 ? (
                            <div className={styles.noEvents}>
                                <p>Không có sự kiện nào</p>
                            </div>
                        ) : (
                            selectedDateEvents.map((event) => {
                                const eventType = EVENT_TYPES.find(t => t.value === event.type);
                                const isHoliday = event.isHoliday;
                                return (
                                    <div
                                        key={event.id}
                                        className={`${styles.eventCard} ${isHoliday ? styles.holidayCard : ''}`}
                                        style={{ borderLeftColor: event.color }}
                                    >
                                        <div className={styles.eventInfo}>
                                            <span className={styles.eventEmoji}>{event.emoji}</span>
                                            <div>
                                                <span className={styles.eventTitle}>
                                                    {event.title}
                                                    {event.isCountdown && <span className={styles.countdownBadge}>📍</span>}
                                                </span>
                                                <span
                                                    className={styles.eventType}
                                                    style={{ color: event.color }}
                                                >
                                                    {isHoliday ? '🎌 Ngày lễ' : eventType?.label}
                                                </span>
                                            </div>
                                        </div>
                                        {!isHoliday && (
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => removeEvent(event.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Thêm sự kiện mới</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Tiêu đề</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Nhập tiêu đề sự kiện"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Loại sự kiện</label>
                                <div className={styles.typeGrid}>
                                    {EVENT_TYPES.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            className={`${styles.typeBtn} ${newEvent.type === type.value ? styles.typeBtnActive : ''}`}
                                            onClick={() => setNewEvent({ ...newEvent, type: type.value })}
                                        >
                                            <span>{type.emoji}</span>
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Ngày</label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={newEvent.isCountdown}
                                        onChange={(e) => setNewEvent({ ...newEvent, isCountdown: e.target.checked })}
                                    />
                                    <span>📍 Hiển thị đếm ngày (countdown)</span>
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Thêm sự kiện
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
