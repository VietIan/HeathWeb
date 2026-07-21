'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './FestiveEffects.module.css';

const EFFECTS = {
    snow: {
        count: 50,
        emoji: '❄️',
        speed: 3,
    },
    hearts: {
        count: 30,
        emoji: '💕',
        speed: 2,
    },
    confetti: {
        count: 60,
        emoji: ['🎊', '🎉', '✨', '⭐'],
        speed: 4,
    },
    flowers: {
        count: 25,
        emoji: ['🌸', '🌺', '🌷', '💐'],
        speed: 2,
    },
    fireworks: {
        count: 40,
        emoji: ['🎆', '🎇', '✨', '💥'],
        speed: 5,
    },
    lanterns: {
        count: 20,
        emoji: '🏮',
        speed: 1,
    },
    pumpkins: {
        count: 15,
        emoji: ['🎃', '👻', '🦇', '🕷️'],
        speed: 2,
    },
    tet: {
        count: 40,
        emoji: ['🧧', '🏮', '🌸', '🎊', '🧨', '🍊'],
        speed: 2,
    },
    balloons: {
        count: 25,
        emoji: ['🎈', '🎉', '🎀'],
        speed: 1.5,
    },
};

const Particle = ({ emoji, delay, duration, left, size }) => {
    return (
        <div
            className={styles.particle}
            style={{
                '--delay': `${delay}s`,
                '--duration': `${duration}s`,
                '--left': `${left}%`,
                '--size': `${size}rem`,
            }}
        >
            {emoji}
        </div>
    );
};

export default function FestiveEffects({ effect, intensity = 1 }) {
    const [particles, setParticles] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!effect || !EFFECTS[effect]) return;

        const config = EFFECTS[effect];
        const count = Math.floor(config.count * intensity);
        const newParticles = [];

        for (let i = 0; i < count; i++) {
            const emoji = Array.isArray(config.emoji)
                ? config.emoji[Math.floor(Math.random() * config.emoji.length)]
                : config.emoji;

            newParticles.push({
                id: i,
                emoji,
                delay: Math.random() * 10,
                duration: (8 + Math.random() * 8) / config.speed,
                left: Math.random() * 100,
                size: 1 + Math.random() * 1.5,
            });
        }

        setParticles(newParticles);
    }, [effect, intensity]);

    if (!effect || particles.length === 0) return null;

    return (
        <div ref={containerRef} className={styles.effectsContainer}>
            {particles.map((p) => (
                <Particle key={p.id} {...p} />
            ))}
        </div>
    );
}
