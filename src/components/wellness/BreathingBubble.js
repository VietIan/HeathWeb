'use client';

import { useState, useEffect } from 'react';
import styles from './BreathingBubble.module.css';

const BREATHING_PHASES = [
    { name: 'Hít vào', duration: 4, instruction: 'Hít sâu qua mũi...' },
    { name: 'Giữ', duration: 7, instruction: 'Giữ hơi thở...' },
    { name: 'Thở ra', duration: 8, instruction: 'Thở ra từ từ qua miệng...' },
];

export default function BreathingBubble({ isOpen, onClose, cycles = 3 }) {
    const [isRunning, setIsRunning] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [timeLeft, setTimeLeft] = useState(BREATHING_PHASES[0].duration);
    const [cycleCount, setCycleCount] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!isRunning) return;

        const timer = setInterval(() => {
            setTimeLeft((time) => {
                if (time <= 1) {
                    // Move to next phase
                    const nextPhase = (currentPhase + 1) % BREATHING_PHASES.length;

                    if (nextPhase === 0) {
                        // Completed one cycle
                        const newCycleCount = cycleCount + 1;
                        setCycleCount(newCycleCount);

                        if (newCycleCount >= cycles) {
                            setIsRunning(false);
                            setIsComplete(true);
                            return 0;
                        }
                    }

                    setCurrentPhase(nextPhase);
                    return BREATHING_PHASES[nextPhase].duration;
                }
                return time - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, currentPhase, cycleCount, cycles]);

    const startBreathing = () => {
        setIsRunning(true);
        setCurrentPhase(0);
        setTimeLeft(BREATHING_PHASES[0].duration);
        setCycleCount(0);
        setIsComplete(false);
    };

    const stopBreathing = () => {
        setIsRunning(false);
        setCurrentPhase(0);
        setTimeLeft(BREATHING_PHASES[0].duration);
    };

    const handleClose = () => {
        stopBreathing();
        setIsComplete(false);
        onClose?.();
    };

    if (!isOpen) return null;

    const phase = BREATHING_PHASES[currentPhase];
    const totalDuration = BREATHING_PHASES.reduce((sum, p) => sum + p.duration, 0);
    const progress = isComplete ? 100 : (cycleCount * totalDuration +
        BREATHING_PHASES.slice(0, currentPhase).reduce((sum, p) => sum + p.duration, 0) +
        (phase.duration - timeLeft)) / (cycles * totalDuration) * 100;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.container} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={handleClose}>×</button>

                <h2 className={styles.title}>🧘 Thở thư giãn</h2>
                <p className={styles.subtitle}>Kỹ thuật 4-7-8</p>

                {/* Breathing Circle */}
                <div className={styles.breathingWrapper}>
                    <div
                        className={`${styles.breathingCircle} ${isRunning ? styles[`phase${currentPhase}`] : ''}`}
                    >
                        <div className={styles.innerCircle}>
                            {!isRunning && !isComplete && (
                                <span className={styles.startText}>Bắt đầu</span>
                            )}
                            {isRunning && (
                                <>
                                    <span className={styles.phaseName}>{phase.name}</span>
                                    <span className={styles.timer}>{timeLeft}</span>
                                </>
                            )}
                            {isComplete && (
                                <span className={styles.completeText}>✨</span>
                            )}
                        </div>
                    </div>

                    {isRunning && (
                        <p className={styles.instruction}>{phase.instruction}</p>
                    )}
                </div>

                {/* Progress */}
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <p className={styles.cycleInfo}>
                    {isComplete ? 'Hoàn thành!' : `Vòng ${cycleCount + 1}/${cycles}`}
                </p>

                {/* Controls */}
                <div className={styles.controls}>
                    {!isRunning && !isComplete && (
                        <button className={styles.startBtn} onClick={startBreathing}>
                            Bắt đầu thở
                        </button>
                    )}
                    {isRunning && (
                        <button className={styles.stopBtn} onClick={stopBreathing}>
                            Dừng lại
                        </button>
                    )}
                    {isComplete && (
                        <button className={styles.doneBtn} onClick={handleClose}>
                            Cảm thấy tốt hơn! 💚
                        </button>
                    )}
                </div>

                <p className={styles.benefits}>
                    💡 Giúp giảm stress, hạ nhịp tim và thư giãn cơ thể
                </p>
            </div>
        </div>
    );
}
