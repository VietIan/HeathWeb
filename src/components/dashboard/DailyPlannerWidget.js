'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, CalendarCheck2, ListTodo, Target } from 'lucide-react';
import { getLocalDateKey } from '@/lib/utils/dateUtils';
import styles from './DailyPlannerWidget.module.css';

const toDate = (value) => {
    if (!value) return null;
    if (value?.toDate) return value.toDate();
    if (value?.seconds) return new Date(value.seconds * 1000);
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const priorityWeight = { high: 0, medium: 1, low: 2 };

export default function DailyPlannerWidget({ tasks = [], events = [] }) {
    const todayKey = getLocalDateKey(new Date());
    const pendingTasks = tasks.filter((task) => !task.completed);
    const actionableTasks = pendingTasks
        .map((task) => {
            const deadline = toDate(task.deadline);
            return {
                ...task,
                deadlineKey: deadline ? getLocalDateKey(deadline) : null,
            };
        })
        .filter((task) => task.deadlineKey && task.deadlineKey <= todayKey)
        .sort((a, b) => {
            if (a.deadlineKey !== b.deadlineKey) return a.deadlineKey.localeCompare(b.deadlineKey);
            return (priorityWeight[a.priority] ?? 1) - (priorityWeight[b.priority] ?? 1);
        });
    const todayEvents = events.filter((event) => event.date === todayKey);
    const overdueCount = actionableTasks.filter((task) => task.deadlineKey < todayKey).length;
    const suggestedTask = actionableTasks[0] || pendingTasks
        .slice()
        .sort((a, b) => (priorityWeight[a.priority] ?? 1) - (priorityWeight[b.priority] ?? 1))[0];

    return (
        <section className={styles.plannerCard}>
            <div className={styles.cardIntro}>
                <span className={styles.kicker}><Target size={14} /> Trung tâm ngày mới</span>
                <h2>Ngày của tôi</h2>
                <p>Gom việc quan trọng, lịch, thói quen và inbox vào một chỗ.</p>
            </div>

            <div className={styles.metrics}>
                <div className={styles.metric}>
                    <ListTodo size={18} />
                    <strong>{actionableTasks.length}</strong>
                    <span>việc cần xử lý</span>
                </div>
                <div className={styles.metric}>
                    <CalendarCheck2 size={18} />
                    <strong>{todayEvents.length}</strong>
                    <span>lịch hôm nay</span>
                </div>
                <div className={`${styles.metric} ${overdueCount ? styles.metricWarning : ''}`}>
                    <AlertCircle size={18} />
                    <strong>{overdueCount}</strong>
                    <span>việc quá hạn</span>
                </div>
            </div>

            <div className={styles.nextAction}>
                <span>Nên bắt đầu với</span>
                <strong>{suggestedTask?.title || 'Chọn Top 3 cho hôm nay'}</strong>
            </div>

            <Link href="/dashboard/today" className={styles.openButton}>
                Mở kế hoạch hôm nay
                <ArrowRight size={17} />
            </Link>
        </section>
    );
}

