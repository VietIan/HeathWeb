'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Archive,
    ArrowRight,
    CalendarDays,
    Check,
    CheckCircle2,
    Circle,
    Clock3,
    Inbox,
    ListTodo,
    Loader2,
    Plus,
    Save,
    Sparkles,
    StickyNote,
    Target,
    Trash2,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTasks } from '@/lib/hooks/useTasks';
import { useCalendar } from '@/lib/hooks/useCalendar';
import { useDailyPlanner } from '@/lib/hooks/useDailyPlanner';
import { getLocalDateKey } from '@/lib/utils/dateUtils';
import styles from './today.module.css';

const HABIT_TEMPLATES = [
    { name: 'Uống đủ nước', emoji: '💧', color: '#60A5FA' },
    { name: 'Vận động 20 phút', emoji: '🏃', color: '#4ADE80' },
    { name: 'Học 20 phút', emoji: '📚', color: '#A78BFA' },
    { name: 'Dọn inbox', emoji: '🧹', color: '#FBBF24' },
];

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

const toDate = (value) => {
    if (!value) return null;
    if (value?.toDate) return value.toDate();
    if (value?.seconds) return new Date(value.seconds * 1000);
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDeadlineKey = (task) => {
    const date = toDate(task.deadline);
    return date ? getLocalDateKey(date) : null;
};

const formatShortTime = (value) => {
    const date = toDate(value);
    if (!date) return '';
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const formatInboxTime = (item) => {
    const date = toDate(item.addedAt || item.createdAt);
    if (!date) return '';
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
    }).format(date);
};

export default function TodayPage() {
    const { user, userData } = useAuth();
    const today = useMemo(() => new Date(), []);
    const todayKey = useMemo(() => getLocalDateKey(today), [today]);
    const { tasks, loading: tasksLoading, createTask, toggleComplete } = useTasks();
    const { events, loading: eventsLoading } = useCalendar();
    const planner = useDailyPlanner(todayKey);

    const [captureText, setCaptureText] = useState('');
    const [captureMode, setCaptureMode] = useState('inbox');
    const [habitName, setHabitName] = useState('');
    const [note, setNote] = useState('');
    const [message, setMessage] = useState('');
    const [busyItemId, setBusyItemId] = useState(null);

    useEffect(() => {
        setNote(planner.plan.note || '');
    }, [planner.plan.note]);

    useEffect(() => {
        if (!message) return undefined;
        const timeout = setTimeout(() => setMessage(''), 3500);
        return () => clearTimeout(timeout);
    }, [message]);

    const pendingTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);

    const focusTasks = useMemo(() => planner.plan.focusTaskIds
        .map((taskId) => tasks.find((task) => task.id === taskId))
        .filter(Boolean), [planner.plan.focusTaskIds, tasks]);

    const suggestedTasks = useMemo(() => pendingTasks
        .filter((task) => !planner.plan.focusTaskIds.includes(task.id))
        .sort((a, b) => {
            const aDate = getDeadlineKey(a) || '9999-12-31';
            const bDate = getDeadlineKey(b) || '9999-12-31';
            if (aDate !== bDate) return aDate.localeCompare(bDate);
            return (PRIORITY_WEIGHT[a.priority] ?? 1) - (PRIORITY_WEIGHT[b.priority] ?? 1);
        }), [pendingTasks, planner.plan.focusTaskIds]);

    const dueTasks = useMemo(() => pendingTasks
        .filter((task) => {
            const deadlineKey = getDeadlineKey(task);
            return deadlineKey && deadlineKey <= todayKey;
        })
        .sort((a, b) => getDeadlineKey(a).localeCompare(getDeadlineKey(b))), [pendingTasks, todayKey]);

    const todayEvents = useMemo(() => events
        .filter((event) => event.date === todayKey)
        .sort((a, b) => (a.time || '').localeCompare(b.time || '')), [events, todayKey]);

    const completedFocusCount = focusTasks.filter((task) => task.completed).length;
    const completedHabitCount = planner.habits.filter((habit) => (
        planner.plan.completedHabitIds.includes(habit.id)
    )).length;
    const progressTotal = focusTasks.length + planner.habits.length;
    const progressDone = completedFocusCount + completedHabitCount;
    const progressPercent = progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0;

    const displayName = userData?.displayName || user?.displayName || 'bạn';
    const formattedDate = new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(today);

    const createTodayTask = async (title) => {
        const deadline = new Date();
        deadline.setHours(23, 59, 0, 0);
        return createTask({
            title: title.trim(),
            description: '',
            deadline,
            priority: 'medium',
            energy: 'medium',
            urgency: 'not-urgent',
            importance: 'important',
            source: 'daily-planner',
        });
    };

    const handleCapture = async (event) => {
        event.preventDefault();
        const text = captureText.trim();
        if (!text) return;

        if (captureMode === 'task') {
            const taskRef = await createTodayTask(text);
            if (taskRef) {
                await planner.addFocusTask(taskRef.id);
                setMessage('Đã tạo việc và đưa vào kế hoạch hôm nay.');
                setCaptureText('');
            }
            return;
        }

        const item = await planner.captureInboxItem(text);
        if (item) {
            setMessage('Đã cất vào inbox để xử lý sau.');
            setCaptureText('');
        }
    };

    const handleConvertInbox = async (item) => {
        setBusyItemId(item.id);
        const taskRef = await createTodayTask(item.text);
        if (taskRef) {
            await planner.resolveInboxItem(item.id, 'converted-to-task');
            await planner.addFocusTask(taskRef.id);
            setMessage('Đã chuyển thành công việc hôm nay.');
        }
        setBusyItemId(null);
    };

    const handleArchiveInbox = async (item) => {
        setBusyItemId(item.id);
        const success = await planner.resolveInboxItem(item.id, 'done');
        if (success) setMessage('Đã xử lý xong mục trong inbox.');
        setBusyItemId(null);
    };

    const handleAddHabit = async (event) => {
        event.preventDefault();
        if (!habitName.trim()) return;
        const success = await planner.createHabit({
            name: habitName,
            emoji: '✓',
            color: '#FF9F5A',
        });
        if (success) {
            setHabitName('');
            setMessage('Đã thêm thói quen mới.');
        }
    };

    const handleDeleteHabit = async (habit) => {
        if (!window.confirm(`Xóa thói quen “${habit.name}”?`)) return;
        const success = await planner.removeHabit(habit.id);
        if (success) setMessage('Đã xóa thói quen.');
    };

    const handleSaveNote = async () => {
        const success = await planner.saveNote(note.trim());
        if (success) setMessage('Đã lưu ghi chú trong ngày.');
    };

    if (planner.loading || tasksLoading) {
        return (
            <div className={styles.loadingState}>
                <Loader2 size={30} />
                <p>Đang chuẩn bị ngày của bạn...</p>
            </div>
        );
    }

    return (
        <div className={styles.todayPage}>
            <header className={styles.hero}>
                <div className={styles.heroCopy}>
                    <span className={styles.eyebrow}><Sparkles size={15} /> Ngày của tôi</span>
                    <h1>Chào {displayName}, hôm nay mình làm gì?</h1>
                    <p className={styles.dateLabel}>{formattedDate}</p>
                </div>

                <div className={styles.progressCard}>
                    <div
                        className={styles.progressRing}
                        style={{ '--day-progress': `${progressPercent * 3.6}deg` }}
                        aria-label={`Tiến độ hôm nay ${progressPercent}%`}
                    >
                        <span>{progressPercent}%</span>
                    </div>
                    <div>
                        <strong>{progressDone}/{progressTotal || 0} mục hoàn thành</strong>
                        <p>{progressTotal ? 'Mỗi bước nhỏ đều được tính.' : 'Chọn Top 3 và thêm thói quen để bắt đầu.'}</p>
                    </div>
                </div>
            </header>

            <form className={styles.captureBar} onSubmit={handleCapture}>
                <div className={styles.captureIcon}><Inbox size={20} /></div>
                <input
                    value={captureText}
                    onChange={(event) => setCaptureText(event.target.value)}
                    placeholder="Ghi nhanh việc, ý tưởng hoặc điều cần nhớ..."
                    aria-label="Nội dung ghi nhanh"
                />
                <div className={styles.captureMode}>
                    <button
                        type="button"
                        className={captureMode === 'inbox' ? styles.modeActive : ''}
                        onClick={() => setCaptureMode('inbox')}
                    >
                        Inbox
                    </button>
                    <button
                        type="button"
                        className={captureMode === 'task' ? styles.modeActive : ''}
                        onClick={() => setCaptureMode('task')}
                    >
                        Việc hôm nay
                    </button>
                </div>
                <button className={styles.captureSubmit} type="submit" disabled={!captureText.trim() || planner.saving}>
                    <Plus size={18} />
                    Thêm
                </button>
            </form>

            {(planner.error || message) && (
                <div className={`${styles.feedback} ${planner.error ? styles.feedbackError : ''}`}>
                    <span>{planner.error || message}</span>
                    {planner.error && (
                        <button type="button" onClick={planner.clearError}>Đóng</button>
                    )}
                </div>
            )}

            <div className={styles.mainGrid}>
                <div className={styles.primaryColumn}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <span className={styles.panelKicker}><Target size={15} /> Tập trung</span>
                                <h2>Top 3 hôm nay</h2>
                            </div>
                            <span className={styles.counter}>{focusTasks.length}/3</span>
                        </div>

                        <div className={styles.focusList}>
                            {focusTasks.length === 0 && (
                                <div className={styles.emptyCompact}>
                                    <Target size={24} />
                                    <div>
                                        <strong>Chưa chọn việc quan trọng nhất</strong>
                                        <p>Chọn tối đa 3 việc để ngày hôm nay có trọng tâm.</p>
                                    </div>
                                </div>
                            )}

                            {focusTasks.map((task, index) => (
                                <div key={task.id} className={`${styles.focusTask} ${task.completed ? styles.itemCompleted : ''}`}>
                                    <span className={styles.focusNumber}>{index + 1}</span>
                                    <button
                                        type="button"
                                        className={styles.checkButton}
                                        onClick={() => toggleComplete(task.id)}
                                        aria-label={task.completed ? `Đánh dấu ${task.title} chưa xong` : `Hoàn thành ${task.title}`}
                                    >
                                        {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                                    </button>
                                    <div className={styles.taskCopy}>
                                        <strong>{task.title}</strong>
                                        <span>
                                            {getDeadlineKey(task) === todayKey ? `Hạn hôm nay ${formatShortTime(task.deadline)}` : 'Ưu tiên hôm nay'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.iconButton}
                                        onClick={() => planner.removeFocusTask(task.id)}
                                        title="Bỏ khỏi Top 3"
                                        aria-label={`Bỏ ${task.title} khỏi Top 3`}
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {focusTasks.length < 3 && (
                            <div className={styles.suggestions}>
                                <span>Gợi ý từ danh sách việc</span>
                                {suggestedTasks.length === 0 ? (
                                    <Link href="/dashboard/tasks" className={styles.textLink}>
                                        Tạo công việc mới <ArrowRight size={14} />
                                    </Link>
                                ) : (
                                    <div className={styles.suggestionList}>
                                        {suggestedTasks.slice(0, 4).map((task) => (
                                            <button
                                                key={task.id}
                                                type="button"
                                                onClick={() => planner.addFocusTask(task.id)}
                                                disabled={planner.saving}
                                            >
                                                <Plus size={14} />
                                                <span>{task.title}</span>
                                                {getDeadlineKey(task) && getDeadlineKey(task) <= todayKey && <em>cần xử lý</em>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <span className={styles.panelKicker}><Inbox size={15} /> Thu gom</span>
                                <h2>Inbox cần xử lý</h2>
                            </div>
                            <span className={styles.counter}>{planner.inbox.length}</span>
                        </div>

                        {planner.inbox.length === 0 ? (
                            <div className={styles.emptyCompact}>
                                <Check size={24} />
                                <div>
                                    <strong>Inbox đang sạch</strong>
                                    <p>Dùng ô ghi nhanh phía trên hoặc Ctrl + Space bất cứ lúc nào.</p>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.inboxList}>
                                {planner.inbox.slice(0, 8).map((item) => (
                                    <div key={item.id} className={styles.inboxItem}>
                                        <div className={styles.inboxCopy}>
                                            <strong>{item.text}</strong>
                                            <span>{formatInboxTime(item)}</span>
                                        </div>
                                        <div className={styles.inboxActions}>
                                            <button
                                                type="button"
                                                onClick={() => handleConvertInbox(item)}
                                                disabled={busyItemId === item.id}
                                            >
                                                {busyItemId === item.id ? <Loader2 size={15} className={styles.spinner} /> : <ListTodo size={15} />}
                                                Thành việc
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.archiveButton}
                                                onClick={() => handleArchiveInbox(item)}
                                                disabled={busyItemId === item.id}
                                                title="Đánh dấu đã xử lý"
                                            >
                                                <Archive size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <aside className={styles.sideColumn}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <span className={styles.panelKicker}><CheckCircle2 size={15} /> Nhịp sống</span>
                                <h2>Thói quen hôm nay</h2>
                            </div>
                            <span className={styles.counter}>{completedHabitCount}/{planner.habits.length}</span>
                        </div>

                        <div className={styles.habitList}>
                            {planner.habits.map((habit) => {
                                const completed = planner.plan.completedHabitIds.includes(habit.id);
                                return (
                                    <div key={habit.id} className={`${styles.habitItem} ${completed ? styles.habitCompleted : ''}`}>
                                        <button
                                            type="button"
                                            className={styles.habitToggle}
                                            onClick={() => planner.toggleHabit(habit.id)}
                                            disabled={planner.saving}
                                            aria-label={completed ? `Bỏ hoàn thành ${habit.name}` : `Hoàn thành ${habit.name}`}
                                        >
                                            <span style={{ '--habit-color': habit.color }}>{habit.emoji}</span>
                                            <strong>{habit.name}</strong>
                                            {completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.habitDelete}
                                            onClick={() => handleDeleteHabit(habit)}
                                            aria-label={`Xóa thói quen ${habit.name}`}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <form className={styles.habitForm} onSubmit={handleAddHabit}>
                            <input
                                value={habitName}
                                onChange={(event) => setHabitName(event.target.value)}
                                placeholder="Thêm thói quen riêng..."
                                aria-label="Tên thói quen mới"
                            />
                            <button type="submit" disabled={!habitName.trim() || planner.saving} aria-label="Thêm thói quen">
                                <Plus size={18} />
                            </button>
                        </form>

                        <div className={styles.templateList}>
                            {HABIT_TEMPLATES
                                .filter((template) => !planner.habits.some((habit) => habit.name === template.name))
                                .slice(0, 4)
                                .map((template) => (
                                    <button
                                        key={template.name}
                                        type="button"
                                        onClick={() => planner.createHabit(template)}
                                        disabled={planner.saving}
                                    >
                                        {template.emoji} {template.name}
                                    </button>
                                ))}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <span className={styles.panelKicker}><CalendarDays size={15} /> Nhìn trước</span>
                                <h2>Lịch hôm nay</h2>
                            </div>
                            <Link href="/dashboard/calendar" className={styles.iconButton} aria-label="Mở lịch">
                                <ArrowRight size={17} />
                            </Link>
                        </div>

                        {eventsLoading ? (
                            <div className={styles.inlineLoading}><Loader2 size={18} /> Đang tải lịch...</div>
                        ) : todayEvents.length === 0 && dueTasks.length === 0 ? (
                            <div className={styles.emptyAgenda}>Hôm nay chưa có lịch hoặc deadline.</div>
                        ) : (
                            <div className={styles.agendaList}>
                                {todayEvents.map((event) => (
                                    <div key={event.id} className={styles.agendaItem}>
                                        <span className={styles.agendaMarker} style={{ background: event.color || '#FF9F5A' }} />
                                        <div>
                                            <strong>{event.emoji || '📅'} {event.title}</strong>
                                            <span>{event.time || 'Cả ngày'}</span>
                                        </div>
                                    </div>
                                ))}
                                {dueTasks.map((task) => (
                                    <div key={task.id} className={styles.agendaItem}>
                                        <span className={`${styles.agendaMarker} ${getDeadlineKey(task) < todayKey ? styles.overdueMarker : ''}`} />
                                        <div>
                                            <strong>{task.title}</strong>
                                            <span>
                                                {getDeadlineKey(task) < todayKey ? 'Đã quá hạn' : `Hạn ${formatShortTime(task.deadline)}`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <span className={styles.panelKicker}><StickyNote size={15} /> Ghi nhớ</span>
                                <h2>Ghi chú trong ngày</h2>
                            </div>
                        </div>
                        <textarea
                            className={styles.dailyNote}
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Ý tưởng, số điện thoại, điều cần nhớ..."
                            rows={6}
                        />
                        <button
                            type="button"
                            className={styles.saveNoteButton}
                            onClick={handleSaveNote}
                            disabled={planner.saving || note.trim() === (planner.plan.note || '')}
                        >
                            {planner.saving ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
                            Lưu ghi chú
                        </button>
                    </section>
                </aside>
            </div>

            <footer className={styles.pageFooter}>
                <Clock3 size={15} />
                <span>Kế hoạch được lưu riêng theo từng ngày trong tài khoản của bạn.</span>
            </footer>
        </div>
    );
}
