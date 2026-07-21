'use client';

import Link from 'next/link';
import { ListTodo, CheckCircle2 } from 'lucide-react';
import styles from './widgets.module.css';

export default function TaskWidget({ tasks }) {
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.completed).length || 0;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <Link href="/dashboard/tasks" className={styles.widget}>
            <div className={styles.widgetHeader}>
                <span className={styles.widgetTitle}>Công việc</span>
                <div
                    className={styles.widgetIcon}
                    style={{ background: 'linear-gradient(135deg, #4ADE80 0%, #22D3EE 100%)' }}
                >
                    <ListTodo size={18} color="white" />
                </div>
            </div>

            <div className={styles.widgetValue}>
                <CheckCircle2 size={24} className={styles.taskIcon} />
                <span>{completedTasks}/{totalTasks}</span>
            </div>

            <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${completionRate}%` }}
                    />
                </div>
                <span className={styles.progressText}>{completionRate}%</span>
            </div>

            {pendingTasks > 0 && (
                <p className={styles.widgetSubtext}>
                    Còn {pendingTasks} việc cần làm
                </p>
            )}
        </Link>
    );
}
