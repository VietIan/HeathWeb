'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { logOut } from '@/lib/firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './Sidebar.module.css';

const navItems = [
    { href: '/dashboard', icon: 'home', label: 'Tổng quan', exact: true },
    { href: '/dashboard/tasks', icon: 'list-check', label: 'Công việc' },
    { href: '/dashboard/calendar', icon: 'calendar-days', label: 'Lịch' },
    { href: '/dashboard/mood', icon: 'face-smile', label: 'Tâm trạng' },
    { href: '/dashboard/journal', icon: 'book', label: 'Nhật ký' },
    { href: '/dashboard/attendance', icon: 'clipboard-check', label: 'Chấm công' },
    { href: '/dashboard/flashcards', icon: 'language', label: 'Bộ thủ' },
    { href: '/dashboard/quick', icon: 'bolt', label: 'Quick' },
    { href: '/dashboard/stats', icon: 'chart-line', label: 'Thống kê' },
];

export default function Sidebar({ isOpen, onClose }) {
    const { user, userData } = useAuth();
    const pathname = usePathname();
    const navRef = useRef(null);
    const sidebarRef = useRef(null);

    // Animate nav items on mount with CSS
    useEffect(() => {
        if (navRef.current) {
            const items = navRef.current.querySelectorAll('a');
            items.forEach((item, i) => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                item.style.transition = `opacity 0.4s ease ${0.2 + i * 0.05}s, transform 0.4s ease ${0.2 + i * 0.05}s`;
                requestAnimationFrame(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                });
            });
        }
    }, []);

    const handleLogout = async () => {
        await logOut();
    };

    const isActive = (href, exact = false) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    const displayName = userData?.displayName || user?.displayName || 'User';
    const email = user?.email || '';
    const photoURL = userData?.photoURL || user?.photoURL;

    return (
        <>
            {/* Mobile Header */}
            <div className={styles.mobileHeader}>
                <button className={styles.menuBtn} onClick={() => onClose?.()}>
                    <FontAwesomeIcon icon="bars" size="lg" />
                </button>
                <div className={styles.mobileLogo}>
                    <FontAwesomeIcon icon="heart" />
                    <span>HealWeb</span>
                </div>
                <div style={{ width: 40 }} />
            </div>

            {/* Overlay */}
            {isOpen && <div className={styles.overlay} onClick={onClose} />}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
            >
                <div className={styles.sidebarHeader}>
                    <Link href="/dashboard" className={styles.logo}>
                        <FontAwesomeIcon icon="heart" className={styles.logoIcon} />
                        <span>HealWeb</span>
                    </Link>
                </div>

                <nav ref={navRef} className={styles.nav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive(item.href, item.exact) ? styles.navItemActive : ''}`}
                            onClick={onClose}
                        >
                            <FontAwesomeIcon icon={item.icon} fixedWidth />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        {photoURL ? (
                            <Image
                                src={photoURL}
                                alt={displayName}
                                width={40}
                                height={40}
                                className={styles.userAvatar}
                            />
                        ) : (
                            <div className={styles.userAvatarPlaceholder}>
                                <FontAwesomeIcon icon="user" />
                            </div>
                        )}
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{displayName}</span>
                            <span className={styles.userEmail}>{email}</span>
                        </div>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <FontAwesomeIcon icon="right-from-bracket" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
