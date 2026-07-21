'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, Coffee, Trees, Waves, Wind } from 'lucide-react';
import styles from './LofiPlayer.module.css';

const SOUNDS = [
    { id: 'rain', label: 'Mưa', icon: CloudRain, url: 'https://cdn.pixabay.com/audio/2022/05/16/audio_58b35f8c2b.mp3' },
    { id: 'cafe', label: 'Cafe', icon: Coffee, url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_6b6a3a7c88.mp3' },
    { id: 'forest', label: 'Rừng', icon: Trees, url: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d9a28b0a5d.mp3' },
    { id: 'waves', label: 'Sóng biển', icon: Waves, url: 'https://cdn.pixabay.com/audio/2022/06/25/audio_f5adcd56bc.mp3' },
    { id: 'wind', label: 'Gió', icon: Wind, url: 'https://cdn.pixabay.com/audio/2022/04/27/audio_15dfb1c0de.mp3' },
];

export default function LofiPlayer({ isPlaying: externalPlaying, onPlayChange }) {
    const [activeSound, setActiveSound] = useState(null);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    useEffect(() => {
        // Stop when timer stops
        if (externalPlaying === false && activeSound && audioRef.current) {
            // Optional: keep playing or stop
        }
    }, [externalPlaying]);

    const handleSoundSelect = (sound) => {
        if (activeSound?.id === sound.id) {
            // Toggle off
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setActiveSound(null);
            onPlayChange?.(false);
        } else {
            // Switch or start sound
            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(sound.url);
            audio.loop = true;
            audio.volume = isMuted ? 0 : volume;
            audio.play().catch(console.error);

            audioRef.current = audio;
            setActiveSound(sound);
            onPlayChange?.(true);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div className={styles.lofiPlayer}>
            <div className={styles.header}>
                <span className={styles.title}>🎵 Ambient Sounds</span>
                <button
                    className={styles.muteBtn}
                    onClick={toggleMute}
                    disabled={!activeSound}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>

            <div className={styles.soundGrid}>
                {SOUNDS.map((sound) => {
                    const Icon = sound.icon;
                    const isActive = activeSound?.id === sound.id;

                    return (
                        <button
                            key={sound.id}
                            className={`${styles.soundBtn} ${isActive ? styles.soundActive : ''}`}
                            onClick={() => handleSoundSelect(sound)}
                        >
                            <Icon size={20} />
                            <span>{sound.label}</span>
                            {isActive && (
                                <span className={styles.playingIndicator}>
                                    <span className={styles.wave}></span>
                                    <span className={styles.wave}></span>
                                    <span className={styles.wave}></span>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {activeSound && (
                <div className={styles.volumeControl}>
                    <Volume2 size={14} />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className={styles.volumeSlider}
                    />
                </div>
            )}
        </div>
    );
}
