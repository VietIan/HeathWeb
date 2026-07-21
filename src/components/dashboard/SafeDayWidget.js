'use client';

import { useSafeDay } from '@/lib/hooks/useSafeDay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed } from '@fortawesome/free-solid-svg-icons';
import styles from './widgets.module.css';

export default function SafeDayWidget() {
    const { isSafeDay, loading, toggleSafeDay } = useSafeDay();

    const handleToggle = (e) => {
        e.preventDefault();
        toggleSafeDay();
    };

    return (
        <div
            className={`${styles.widget} ${styles.safeDayWidget} ${isSafeDay ? styles.safeDayActive : ''}`}
            onClick={handleToggle}
        >
            <div className={styles.widgetHeader}>
                <span className={styles.widgetTitle}>Safe Day</span>
                <div
                    className={styles.widgetIcon}
                    style={{
                        background: isSafeDay
                            ? 'linear-gradient(135deg, #A78BFA 0%, #818CF8 100%)'
                            : 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)'
                    }}
                >
                    <FontAwesomeIcon icon={faBed} color="white" />
                </div>
            </div>

            <div className={styles.safeDayContent}>
                <div className={styles.safeDayToggle}>
                    <div className={`${styles.toggleSwitch} ${isSafeDay ? styles.toggleOn : ''}`}>
                        <div className={styles.toggleKnob} />
                    </div>
                    <span className={styles.safeDayStatus}>
                        {isSafeDay ? 'Đã bật' : 'Tắt'}
                    </span>
                </div>

                {isSafeDay ? (
                    <p className={styles.safeDayMessage}>
                        🛌 Hôm nay không tính. Nghỉ ngơi nhé!
                    </p>
                ) : (
                    <p className={styles.safeDayHint}>
                        Bật khi cần ngày nghỉ, không tính streak
                    </p>
                )}
            </div>
        </div>
    );
}
