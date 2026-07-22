'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileNav.module.css';

const mobileNavItems = [
    { href: '/dashboard/today', label: 'Hôm nay', emoji: '☀️' },
    { href: '/dashboard/tasks', label: 'Công việc', emoji: '✓' },
    { type: 'capture', label: 'Ghi nhanh', emoji: '+' },
    { href: '/dashboard/calendar', label: 'Lịch', emoji: '📅' },
    { href: '/dashboard', label: 'Tổng quan', emoji: '⌂', exact: true },
];

export default function MobileNav({ onCapture }) {
    const pathname = usePathname();

    const isActive = (href, exact = false) => {
        if (exact) return pathname === href || pathname === href + '/';
        return pathname.startsWith(href);
    };

    return (
        <nav className={styles.mobileNav} aria-label='Điều hướng nhanh'>
            {mobileNavItems.map((item) => (
                item.type === 'capture' ? (
                    <button
                        key='capture'
                        type='button'
                        className={`${styles.navItem} ${styles.captureItem}`}
                        onClick={onCapture}
                        aria-label='Mở ghi nhanh'
                    >
                        <span className={styles.captureIcon}>{item.emoji}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                    </button>
                ) : (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive(item.href, item.exact) ? styles.navItemActive : ''}`}
                        aria-current={isActive(item.href, item.exact) ? 'page' : undefined}
                    >
                        <span className={styles.navIcon}>{item.emoji}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                    </Link>
                )
            ))}
        </nav>
    );
}
