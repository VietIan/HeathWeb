'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Heart, Sparkles, Target, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}>
                    <Heart className={styles.heartIcon} />
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.landing}>
            {/* Hero Section */}
            <header className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.logo}>
                        <Heart className={styles.logoIcon} />
                        <span>HealWeb</span>
                    </div>

                    <h1 className={styles.title}>
                        <span className={styles.gradient}>Năng suất</span> bắt nguồn từ{' '}
                        <span className={styles.gradient}>Cảm xúc</span>
                    </h1>

                    <p className={styles.subtitle}>
                        Quản lý công việc thông minh kết hợp theo dõi cảm xúc,
                        nhật ký cá nhân và chấm công mỗi ngày.
                        Hiểu bản thân, làm việc hiệu quả hơn.
                    </p>

                    <div className={styles.heroCta}>
                        <button
                            className="btn btn-primary"
                            onClick={() => router.push('/login')}
                        >
                            <Sparkles size={18} />
                            Bắt đầu ngay
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={() => router.push('/signup')}
                        >
                            Đăng ký tài khoản
                        </button>
                    </div>
                </div>

                <div className={styles.heroVisual}>
                    <div className={styles.floatingCards}>
                        <div className={`${styles.floatingCard} ${styles.card1}`}>
                            <span className="emoji-medium">😊</span>
                            <span>Tâm trạng tuyệt vời</span>
                        </div>
                        <div className={`${styles.floatingCard} ${styles.card2}`}>
                            <span className="emoji-medium">🔥</span>
                            <span>Streak 7 ngày</span>
                        </div>
                        <div className={`${styles.floatingCard} ${styles.card3}`}>
                            <span className="emoji-medium">✅</span>
                            <span>5/7 tasks hoàn thành</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className={styles.features}>
                <h2>Tính năng nổi bật</h2>
                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Target />
                        </div>
                        <h3>Quản lý công việc</h3>
                        <p>Theo dõi deadline với countdown trực quan, không bao giờ quên nhiệm vụ quan trọng.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Heart />
                        </div>
                        <h3>Theo dõi cảm xúc</h3>
                        <p>Ghi lại tâm trạng mỗi ngày, hiểu rõ mối liên hệ giữa cảm xúc và hiệu suất.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <BookOpen />
                        </div>
                        <h3>Nhật ký cá nhân</h3>
                        <p>Viết nhật ký với hình ảnh và emoji, lưu giữ những khoảnh khắc đáng nhớ.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Calendar />
                        </div>
                        <h3>Lịch sự kiện</h3>
                        <p>Đánh dấu những ngày quan trọng: sinh nhật, mục tiêu, sự kiện đặc biệt.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <TrendingUp />
                        </div>
                        <h3>Chấm công & Streak</h3>
                        <p>Check-in mỗi ngày, xây dựng thói quen tốt với hệ thống streak động lực.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Sparkles />
                        </div>
                        <h3>Thống kê thông minh</h3>
                        <p>Biểu đồ trực quan về xu hướng cảm xúc, attendance và năng suất.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerLogo}>
                        <Heart size={20} />
                        <span>HealWeb</span>
                    </div>
                    <p>Được xây dựng với ❤️ cho những người muốn làm việc và sống tốt hơn.</p>
                </div>
            </footer>
        </div>
    );
}
