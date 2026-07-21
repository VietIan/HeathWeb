'use client';

import { RARITY_COLORS } from '@/lib/utils/achievements';
import styles from './AchievementToast.module.css';

export default function AchievementToast({ achievement, onClose }) {
    if (!achievement) return null;

    return (
        <div className={styles.toast} style={{ '--rarity-color': RARITY_COLORS[achievement.rarity] }}>
            <div className={styles.glow} />

            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.label}>🏆 THÀNH TỰU MỚI!</span>
                </div>

                <div className={styles.achievementInfo}>
                    <span className={styles.icon}>{achievement.icon}</span>
                    <div className={styles.details}>
                        <h4>{achievement.name}</h4>
                        <p>{achievement.description}</p>
                    </div>
                </div>

                <div className={styles.rarity}>
                    <span style={{ color: RARITY_COLORS[achievement.rarity] }}>
                        ★ {achievement.rarity.toUpperCase()}
                    </span>
                </div>
            </div>

            <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
    );
}
