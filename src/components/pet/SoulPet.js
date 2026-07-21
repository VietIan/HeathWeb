'use client';

import styles from './SoulPet.module.css';

const PET_LEVELS = {
    1: {
        name: 'Trứng Kỳ Lân',
        emoji: '🥚',
        description: 'Một quả trứng bí ẩn đang nở',
    },
    2: {
        name: 'Ghost Dễ Thương',
        emoji: '👻',
        description: 'Một linh hồn nhỏ nhắn và đáng yêu',
    },
    3: {
        name: 'Phượng Hoàng',
        emoji: '🔥',
        description: 'Phượng hoàng lửa huyền thoại!',
    },
};

const MOOD_EXPRESSIONS = {
    excited: { eyes: '✨', mouth: '🤩' },
    happy: { eyes: '◡◡', mouth: '◡' },
    neutral: { eyes: '• •', mouth: '—' },
    sad: { eyes: '• •', mouth: '︵' },
    very_sad: { eyes: '╥ ╥', mouth: '︵' },
};

export default function SoulPet({ petState, mood, onFeed, compact = false }) {
    const level = PET_LEVELS[petState.evolutionLevel] || PET_LEVELS[1];
    const moodExpression = MOOD_EXPRESSIONS[mood] || MOOD_EXPRESSIONS.neutral;

    const getHappinessColor = () => {
        if (petState.happiness >= 80) return '#4ADE80';
        if (petState.happiness >= 60) return '#FACC15';
        if (petState.happiness >= 40) return '#FB923C';
        if (petState.happiness >= 20) return '#F87171';
        return '#EF4444';
    };

    if (compact) {
        return (
            <div className={styles.compactPet}>
                <span className={styles.compactEmoji}>{level.emoji}</span>
                <div className={styles.compactBar}>
                    <div
                        className={styles.compactFill}
                        style={{ width: `${petState.happiness}%`, backgroundColor: getHappinessColor() }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.petContainer}>
            <div className={styles.petHeader}>
                <h3>🐾 Soul Pet</h3>
                <span className={styles.levelBadge}>Lv.{petState.evolutionLevel}</span>
            </div>

            <div className={styles.petAvatar}>
                <div className={`${styles.petBody} ${styles[`level${petState.evolutionLevel}`]} ${styles[mood]}`}>
                    {petState.evolutionLevel === 1 && (
                        <div className={styles.egg}>
                            <span className={styles.eggCrack}>🥚</span>
                            <div className={styles.eggShine} />
                        </div>
                    )}

                    {petState.evolutionLevel === 2 && (
                        <div className={styles.ghost}>
                            <span className={styles.ghostBody}>👻</span>
                            <div className={styles.ghostFloat} />
                        </div>
                    )}

                    {petState.evolutionLevel === 3 && (
                        <div className={styles.phoenix}>
                            <span className={styles.phoenixBody}>🔥</span>
                            <div className={styles.phoenixGlow} />
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.petInfo}>
                <h4>{level.name}</h4>
                <p>{level.description}</p>
            </div>

            <div className={styles.happinessBar}>
                <div className={styles.happinessLabel}>
                    <span>Happiness</span>
                    <span>{petState.happiness}%</span>
                </div>
                <div className={styles.happinessTrack}>
                    <div
                        className={styles.happinessFill}
                        style={{ width: `${petState.happiness}%`, backgroundColor: getHappinessColor() }}
                    />
                </div>
            </div>

            <div className={styles.petStats}>
                <div className={styles.stat}>
                    <span>📅</span>
                    <span>{petState.totalCheckins} check-ins</span>
                </div>
                <div className={styles.stat}>
                    <span>🔥</span>
                    <span>{petState.consecutiveHighHappyDays} ngày vui</span>
                </div>
            </div>

            {onFeed && (
                <button
                    className={styles.feedBtn}
                    onClick={onFeed}
                    disabled={petState.happiness >= 100}
                >
                    🍎 Cho ăn (+15 Happiness)
                </button>
            )}

            {petState.evolutionLevel < 3 && (
                <div className={styles.evolutionHint}>
                    <span>💡</span>
                    <p>Giữ Happiness ≥80% trong 3 ngày để tiến hóa!</p>
                </div>
            )}
        </div>
    );
}
