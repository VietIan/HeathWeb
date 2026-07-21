'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, Square, Coffee, Volume2, VolumeX } from 'lucide-react';
import styles from './PomodoroTimer.module.css';

export default function PomodoroTimer({
    isRunning,
    isPaused,
    mode,
    preset,
    formattedTime,
    progress,
    sessionsToday,
    coinsEarned,
    currentTask,
    onStart,
    onPause,
    onResume,
    onStop,
    onSkipBreak,
    onChangePreset,
    PRESETS,
}) {
    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className={styles.pomodoroContainer}>
            {/* Coins Earned Toast */}
            {coinsEarned > 0 && (
                <div className={styles.coinsToast}>
                    +{coinsEarned} 🪙
                </div>
            )}

            {/* Timer Ring */}
            <div className={styles.timerRing}>
                <svg className={styles.progressRing} viewBox="0 0 260 260">
                    <circle
                        className={styles.progressBg}
                        cx="130"
                        cy="130"
                        r="120"
                        strokeWidth="8"
                        fill="none"
                    />
                    <circle
                        className={`${styles.progressFill} ${mode === 'break' ? styles.breakMode : ''}`}
                        cx="130"
                        cy="130"
                        r="120"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>

                <div className={styles.timerContent}>
                    <span className={styles.modeLabel}>
                        {mode === 'work' ? '🍅 Làm việc' : '☕ Nghỉ ngơi'}
                    </span>
                    <span className={styles.time}>{formattedTime}</span>
                    {currentTask && (
                        <span className={styles.taskName}>{currentTask.title}</span>
                    )}
                </div>
            </div>

            {/* Preset Selector */}
            {!isRunning && (
                <div className={styles.presetSelector}>
                    {Object.entries(PRESETS).map(([key, value]) => (
                        <button
                            key={key}
                            className={`${styles.presetBtn} ${preset === key ? styles.presetActive : ''}`}
                            onClick={() => onChangePreset(key)}
                        >
                            {value.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Controls */}
            <div className={styles.controls}>
                {!isRunning ? (
                    <button className={styles.startBtn} onClick={() => onStart()}>
                        <Play size={24} />
                        Bắt đầu
                    </button>
                ) : (
                    <>
                        {isPaused ? (
                            <button className={styles.controlBtn} onClick={onResume}>
                                <Play size={20} />
                            </button>
                        ) : (
                            <button className={styles.controlBtn} onClick={onPause}>
                                <Pause size={20} />
                            </button>
                        )}
                        <button className={styles.stopBtn} onClick={onStop}>
                            <Square size={20} />
                        </button>
                        {mode === 'break' && (
                            <button className={styles.skipBtn} onClick={onSkipBreak}>
                                <SkipForward size={20} />
                                Bỏ qua
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Sessions Today */}
            <div className={styles.sessionsCounter}>
                <span className={styles.sessionsLabel}>Hôm nay:</span>
                <div className={styles.sessionsDots}>
                    {Array(Math.min(sessionsToday, 8)).fill(null).map((_, i) => (
                        <span key={i} className={styles.sessionDot}>🍅</span>
                    ))}
                    {sessionsToday > 8 && <span className={styles.moreCount}>+{sessionsToday - 8}</span>}
                    {sessionsToday === 0 && <span className={styles.noSessions}>Chưa có session nào</span>}
                </div>
            </div>
        </div>
    );
}
