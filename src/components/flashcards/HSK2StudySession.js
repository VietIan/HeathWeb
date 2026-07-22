'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './HSK2StudySession.module.css';

export default function HSK2StudySession({ queue = [], onReviewWord, onFinishSession }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);

    const currentWord = queue[currentIndex];

    // Reset flip state when card changes
    useEffect(() => {
        setIsFlipped(false);
    }, [currentIndex]);

    // Web Speech API for Pronunciation
    const playAudio = (text) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    if (!currentWord || queue.length === 0) {
        return (
            <div className={styles.emptySession}>
                <FontAwesomeIcon icon="circle-check" size="3x" color="#10B981" />
                <h3>Đã Hoàn Thành Lượt Ôn Hôm Nay!</h3>
                <p>Bạn đã ôn hết tất cả từ vựng trong hàng chờ.</p>
                <button className={styles.finishBtn} onClick={onFinishSession}>
                    Quay Lại Danh Sách
                </button>
            </div>
        );
    }

    const handleRating = async (rating) => {
        await onReviewWord(currentWord.id, rating);
        setReviewedCount(prev => prev + 1);

        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCurrentIndex(queue.length);
        }
    };

    const progressPercent = Math.round(((currentIndex) / queue.length) * 100);

    return (
        <div className={styles.container}>
            <div className={styles.headerBar}>
                <div className={styles.queueInfo}>
                    <span>Thẻ {currentIndex + 1} / {queue.length}</span>
                    {currentWord.hskLevel && <span className={styles.hskBadge}>HSK {currentWord.hskLevel}</span>}
                </div>
                <button className={styles.exitBtn} onClick={onFinishSession}>
                    <FontAwesomeIcon icon="xmark" /> Thoát
                </button>
            </div>

            <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
            </div>

            {/* Flashcard Component */}
            <div
                className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={styles.cardFront}>
                    <button
                        className={styles.speakerBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            playAudio(currentWord.hanzi);
                        }}
                        title="Phát âm tiếng Trung"
                    >
                        <FontAwesomeIcon icon="volume-high" size="lg" />
                    </button>
                    <div className={styles.hanziLarge}>{currentWord.hanzi}</div>
                    <p className={styles.flipHint}>Chạm vào thẻ để xem nghĩa & ví dụ</p>
                </div>

                <div className={styles.cardBack}>
                    <div className={styles.pinyinText}>{currentWord.pinyin}</div>
                    {currentWord.hanViet && <div className={styles.hanVietText}>[{currentWord.hanViet}]</div>}
                    <div className={styles.meaningText}>{currentWord.meaningVi}</div>
                    {currentWord.meaningEn && <div className={styles.meaningEnText}>({currentWord.meaningEn})</div>}

                    {currentWord.exampleZh && (
                        <div className={styles.exampleBlock}>
                            <p className={styles.exampleZh}>{currentWord.exampleZh}</p>
                            <p className={styles.exampleVi}>{currentWord.exampleVi}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Assessment Rating Buttons */}
            {isFlipped && (
                <div className={styles.ratingActions}>
                    <button
                        className={`${styles.ratingBtn} ${styles.againBtn}`}
                        onClick={() => handleRating('again')}
                    >
                        ❌ Quên
                        <span className={styles.ratingSub}>Ôn lại sau</span>
                    </button>
                    <button
                        className={`${styles.ratingBtn} ${styles.hardBtn}`}
                        onClick={() => handleRating('hard')}
                    >
                        ⚠️ Khó
                        <span className={styles.ratingSub}>1 ngày</span>
                    </button>
                    <button
                        className={`${styles.ratingBtn} ${styles.goodBtn}`}
                        onClick={() => handleRating('good')}
                    >
                        👍 Nhớ
                        <span className={styles.ratingSub}>3 ngày</span>
                    </button>
                    <button
                        className={`${styles.ratingBtn} ${styles.easyBtn}`}
                        onClick={() => handleRating('easy')}
                    >
                        🌟 Dễ
                        <span className={styles.ratingSub}>7 ngày</span>
                    </button>
                </div>
            )}
        </div>
    );
}
