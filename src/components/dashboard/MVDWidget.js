'use client';

import { useState } from 'react';
import { useMVD } from '@/lib/hooks/useMVD';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark, faBullseye } from '@fortawesome/free-solid-svg-icons';
import styles from './widgets.module.css';

export default function MVDWidget() {
    const { todayMVD, loading, setTask, toggleComplete, skipToday, stats } = useMVD();
    const [inputTask, setInputTask] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputTask.trim()) {
            await setTask(inputTask);
            setInputTask('');
            setIsEditing(false);
        }
    };

    const handleComplete = (e) => {
        e.preventDefault();
        toggleComplete();
    };

    const handleSkip = (e) => {
        e.preventDefault();
        skipToday();
    };

    return (
        <div className={`${styles.widget} ${styles.mvdWidget}`}>
            <div className={styles.widgetHeader}>
                <span className={styles.widgetTitle}>Minimum Viable Day</span>
                <div
                    className={styles.widgetIcon}
                    style={{ background: 'linear-gradient(135deg, #4ADE80 0%, #22D3EE 100%)' }}
                >
                    <FontAwesomeIcon icon={faBullseye} color="white" />
                </div>
            </div>

            {!todayMVD || todayMVD.skipped ? (
                // No task set for today
                <form onSubmit={handleSubmit} className={styles.mvdForm}>
                    <p className={styles.mvdQuestion}>
                        ❓ Nếu hôm nay chỉ làm được <strong>1 việc</strong>, đó là gì?
                    </p>
                    <input
                        type="text"
                        className={styles.mvdInput}
                        placeholder="Nhập 1 việc quan trọng nhất..."
                        value={inputTask}
                        onChange={(e) => setInputTask(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className={styles.mvdSubmitBtn}>
                        Đặt mục tiêu
                    </button>
                </form>
            ) : (
                // Task exists
                <div className={styles.mvdTaskContainer}>
                    <div className={`${styles.mvdTask} ${todayMVD.completed ? styles.mvdCompleted : ''}`}>
                        <span className={styles.mvdTaskText}>
                            {todayMVD.task}
                        </span>
                    </div>

                    <div className={styles.mvdActions}>
                        <button
                            className={`${styles.mvdBtn} ${todayMVD.completed ? styles.mvdBtnDone : styles.mvdBtnPrimary}`}
                            onClick={handleComplete}
                        >
                            <FontAwesomeIcon icon={faCircleCheck} />
                            {todayMVD.completed ? 'Đã làm ✓' : 'Hoàn thành'}
                        </button>

                        {!todayMVD.completed && (
                            <button
                                className={`${styles.mvdBtn} ${styles.mvdBtnSecondary}`}
                                onClick={handleSkip}
                            >
                                <FontAwesomeIcon icon={faCircleXmark} />
                                Không hôm nay
                            </button>
                        )}
                    </div>

                    {todayMVD.completed && (
                        <p className={styles.mvdSuccess}>
                            🎉 Tuyệt vời! Bạn đã hoàn thành mục tiêu hôm nay!
                        </p>
                    )}
                </div>
            )}

            <div className={styles.mvdStats}>
                <span>📊 Hoàn thành: {stats.completedCount}/{stats.totalCount} ({stats.completionRate}%)</span>
            </div>
        </div>
    );
}
