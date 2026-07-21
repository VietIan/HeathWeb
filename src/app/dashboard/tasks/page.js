'use client';

import { useState } from 'react';
import { useTasks } from '@/lib/hooks/useTasks';
import { useFocusSession } from '@/lib/hooks/useFocusSession';
import PomodoroTimer from '@/components/focus/PomodoroTimer';
import LofiPlayer from '@/components/focus/LofiPlayer';
import EisenhowerMatrix from '@/components/tasks/EisenhowerMatrix';
import { Plus, Calendar, Flag, Trash2, Check, Clock, LayoutGrid, List, Play, Zap, Battery, BatteryLow } from 'lucide-react';
import { getCountdown, getUrgencyLevel, formatDate } from '@/lib/utils/dateUtils';
import styles from './tasks.module.css';

const ENERGY_LEVELS = [
    { value: 'high', label: 'Cao', icon: Zap, color: '#F87171', description: 'Cần tập trung cao độ' },
    { value: 'medium', label: 'Trung bình', icon: Battery, color: '#FBBF24', description: 'Công việc bình thường' },
    { value: 'low', label: 'Thấp', icon: BatteryLow, color: '#4ADE80', description: 'Việc vặt, admin' },
];

export default function TasksPage() {
    const { tasks, loading, createTask, toggleComplete, removeTask, updateTask } = useTasks();
    const focusSession = useFocusSession();

    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'matrix'
    const [showFocusMode, setShowFocusMode] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        energy: 'medium',
        urgency: 'not-urgent',
        importance: 'not-important',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;

        await createTask({
            ...newTask,
            deadline: newTask.deadline ? new Date(newTask.deadline) : null
        });

        setNewTask({
            title: '',
            description: '',
            deadline: '',
            priority: 'medium',
            energy: 'medium',
            urgency: 'not-urgent',
            importance: 'not-important',
        });
        setShowForm(false);
    };

    const handleStartFocus = (task = null) => {
        setSelectedTask(task);
        setShowFocusMode(true);
        focusSession.startSession(task);
    };

    const handleUpdateTaskMatrix = (taskId, updates) => {
        updateTask(taskId, updates);
    };

    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    const getUrgencyClass = (deadline) => {
        if (!deadline) return '';
        const urgency = getUrgencyLevel(deadline?.toDate?.() || deadline);
        return styles[`urgency${urgency.charAt(0).toUpperCase() + urgency.slice(1)}`];
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#F87171';
            case 'medium': return '#FBBF24';
            case 'low': return '#4ADE80';
            default: return '#A0A0C0';
        }
    };

    const getEnergyInfo = (energy) => {
        return ENERGY_LEVELS.find(e => e.value === energy) || ENERGY_LEVELS[1];
    };

    return (
        <div className={styles.tasksPage}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Công việc</h1>
                    <p>Quản lý và theo dõi tiến độ công việc của bạn</p>
                </div>
                <div className={styles.headerActions}>
                    {/* View Toggle */}
                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                        <button
                            className={`${styles.viewBtn} ${viewMode === 'matrix' ? styles.viewActive : ''}`}
                            onClick={() => setViewMode('matrix')}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    {/* Focus Mode Button */}
                    <button
                        className={styles.focusBtn}
                        onClick={() => handleStartFocus()}
                    >
                        <Play size={16} />
                        Focus Mode
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <Plus size={18} />
                        Thêm công việc
                    </button>
                </div>
            </header>

            {/* Focus Mode Panel */}
            {showFocusMode && (
                <div className={styles.focusPanel}>
                    <div className={styles.focusMain}>
                        <PomodoroTimer
                            {...focusSession}
                            onStart={(task) => focusSession.startSession(task || selectedTask)}
                            onPause={focusSession.pauseSession}
                            onResume={focusSession.resumeSession}
                            onStop={() => {
                                focusSession.stopSession();
                                setShowFocusMode(false);
                            }}
                            onSkipBreak={focusSession.skipBreak}
                            onChangePreset={focusSession.changePreset}
                        />
                    </div>
                    <div className={styles.focusSide}>
                        <LofiPlayer />

                        {/* Quick Task Selection */}
                        <div className={styles.quickTasks}>
                            <h4>Chọn task để focus</h4>
                            <div className={styles.quickTaskList}>
                                {pendingTasks.slice(0, 5).map(task => (
                                    <button
                                        key={task.id}
                                        className={`${styles.quickTaskBtn} ${selectedTask?.id === task.id ? styles.quickTaskActive : ''}`}
                                        onClick={() => {
                                            setSelectedTask(task);
                                            if (!focusSession.isRunning) {
                                                focusSession.startSession(task);
                                            }
                                        }}
                                    >
                                        {task.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Form */}
            {showForm && (
                <div className={styles.taskForm}>
                    <h3>Tạo công việc mới</h3>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Tiêu đề *</label>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Nhập tiêu đề công việc..."
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Mô tả</label>
                            <textarea
                                className="glass-input"
                                placeholder="Mô tả chi tiết..."
                                rows={3}
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Deadline</label>
                                <input
                                    type="datetime-local"
                                    className="glass-input"
                                    value={newTask.deadline}
                                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Độ ưu tiên</label>
                                <select
                                    className="glass-input"
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                >
                                    <option value="low">Thấp</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="high">Cao</option>
                                </select>
                            </div>
                        </div>

                        {/* Energy Level */}
                        <div className={styles.formGroup}>
                            <label>Năng lượng cần thiết</label>
                            <div className={styles.energySelector}>
                                {ENERGY_LEVELS.map((level) => {
                                    const Icon = level.icon;
                                    return (
                                        <button
                                            key={level.value}
                                            type="button"
                                            className={`${styles.energyBtn} ${newTask.energy === level.value ? styles.energyActive : ''}`}
                                            style={{ '--energy-color': level.color }}
                                            onClick={() => setNewTask({ ...newTask, energy: level.value })}
                                        >
                                            <Icon size={18} />
                                            <span>{level.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Eisenhower Classification */}
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Mức độ khẩn cấp</label>
                                <select
                                    className="glass-input"
                                    value={newTask.urgency}
                                    onChange={(e) => setNewTask({ ...newTask, urgency: e.target.value })}
                                >
                                    <option value="not-urgent">Không khẩn cấp</option>
                                    <option value="urgent">Khẩn cấp</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mức độ quan trọng</label>
                                <select
                                    className="glass-input"
                                    value={newTask.importance}
                                    onChange={(e) => setNewTask({ ...newTask, importance: e.target.value })}
                                >
                                    <option value="not-important">Không quan trọng</option>
                                    <option value="important">Quan trọng</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Tạo công việc
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Main Content */}
            {viewMode === 'matrix' ? (
                <section className={styles.matrixSection}>
                    <EisenhowerMatrix
                        tasks={tasks}
                        onUpdateTask={handleUpdateTaskMatrix}
                        onTaskClick={handleStartFocus}
                    />
                </section>
            ) : (
                <>
                    {/* Pending Tasks */}
                    <section className={styles.taskSection}>
                        <h2>Cần làm ({pendingTasks.length})</h2>
                        {loading ? (
                            <div className={styles.loading}>Đang tải...</div>
                        ) : pendingTasks.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>🎉 Không có công việc nào! Hãy thêm mới.</p>
                            </div>
                        ) : (
                            <div className={styles.taskList}>
                                {pendingTasks.map((task) => {
                                    const countdown = task.deadline
                                        ? getCountdown(task.deadline?.toDate?.() || task.deadline)
                                        : null;
                                    const energyInfo = getEnergyInfo(task.energy);
                                    const EnergyIcon = energyInfo.icon;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`${styles.taskCard} ${getUrgencyClass(task.deadline)}`}
                                        >
                                            <button
                                                className={styles.checkButton}
                                                onClick={() => toggleComplete(task.id)}
                                            >
                                                <div className={styles.checkbox} />
                                            </button>

                                            <div className={styles.taskContent}>
                                                <div className={styles.taskHeader}>
                                                    <h4>{task.title}</h4>
                                                    <div className={styles.taskBadges}>
                                                        <span
                                                            className={styles.energyBadge}
                                                            style={{ color: energyInfo.color }}
                                                            title={energyInfo.description}
                                                        >
                                                            <EnergyIcon size={14} />
                                                        </span>
                                                        <Flag size={16} style={{ color: getPriorityColor(task.priority) }} />
                                                    </div>
                                                </div>
                                                {task.description && (
                                                    <p className={styles.taskDescription}>{task.description}</p>
                                                )}
                                                {countdown && !countdown.expired && (
                                                    <div className={styles.taskMeta}>
                                                        <Clock size={14} />
                                                        <span>{countdown.text}</span>
                                                    </div>
                                                )}
                                                {countdown?.expired && (
                                                    <div className={`${styles.taskMeta} ${styles.expired}`}>
                                                        <Clock size={14} />
                                                        <span>Đã quá hạn!</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.taskActions}>
                                                <button
                                                    className={styles.focusTaskBtn}
                                                    onClick={() => handleStartFocus(task)}
                                                    title="Focus vào task này"
                                                >
                                                    <Play size={14} />
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => removeTask(task.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                        <section className={styles.taskSection}>
                            <h2>Đã hoàn thành ({completedTasks.length})</h2>
                            <div className={styles.taskList}>
                                {completedTasks.map((task) => (
                                    <div key={task.id} className={`${styles.taskCard} ${styles.completed}`}>
                                        <button
                                            className={styles.checkButton}
                                            onClick={() => toggleComplete(task.id)}
                                        >
                                            <div className={`${styles.checkbox} ${styles.checked}`}>
                                                <Check size={12} />
                                            </div>
                                        </button>

                                        <div className={styles.taskContent}>
                                            <h4 className={styles.taskTitleCompleted}>{task.title}</h4>
                                        </div>

                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => removeTask(task.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
