'use client';

import Link from 'next/link';
import { Plus, Smile, BookOpen, ClipboardCheck, Calendar } from 'lucide-react';
import styles from './widgets.module.css';

const quickActions = [
    { href: '/dashboard/tasks', icon: Plus, label: 'Thêm công việc', color: '#4ADE80' },
    { href: '/dashboard/mood', icon: Smile, label: 'Ghi tâm trạng', color: '#60A5FA' },
    { href: '/dashboard/journal', icon: BookOpen, label: 'Viết nhật ký', color: '#A78BFA' },
    { href: '/dashboard/calendar', icon: Calendar, label: 'Xem lịch', color: '#FBBF24' },
];

export default function QuickActions() {
    return (
        <div className={styles.quickActionsSection}>
            <h3 className={styles.sectionTitle}>Hành động nhanh</h3>
            <div className={styles.quickActionsGrid}>
                {quickActions.map((action) => (
                    <Link key={action.href} href={action.href} className={styles.quickAction}>
                        <div
                            className={styles.quickActionIcon}
                            style={{ background: `${action.color}20`, color: action.color }}
                        >
                            <action.icon size={24} />
                        </div>
                        <span>{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
