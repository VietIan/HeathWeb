'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileNav.module.css';

const mobileNavItems = [
    { href: '/dashboard', label: 'Tổng quan', emoji: '🏠', exact: true },
    { href: '/dashboard/quick', label: 'Quick', emoji: '⚡' },
    { href: '/dashboard/flashcards', label: 'Bộ thủ', emoji: '✍️' },
];

export default function MobileNav() {
    const pathname = usePathname();

    const isActive = (href, exact = false) => {
        if (exact) return pathname === href || pathname === href + '/';
        return pathname.startsWith(href);
    };

    return (
        <nav className={styles.mobileNav}>
            {mobileNavItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${isActive(item.href, item.exact) ? styles.navItemActive : ''}`}
                >
                    <span className={styles.navIcon}>{item.emoji}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
