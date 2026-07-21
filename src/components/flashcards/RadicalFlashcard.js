'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlashcards } from '@/lib/hooks/useFlashcards';
import styles from './RadicalFlashcard.module.css';

const AddRadicalForm = ({ onAdd, onClose }) => {
    const [form, setForm] = useState({
        character: '',
        name: '',
        pinyin: '',
        meaning: '',
        strokes: '',
        examples: '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.character.trim()) return;

        setSaving(true);
        try {
            await onAdd({
                ...form,
                strokes: parseInt(form.strokes) || 0,
            });
            setForm({ character: '', name: '', pinyin: '', meaning: '', strokes: '', examples: '' });
            onClose();
        } catch (error) {
            console.error('Error adding radical:', error);
        }
        setSaving(false);
    };

    return (
        <motion.div
            className={styles.formOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.form
                className={styles.addForm}
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <h3 className={styles.formTitle}>✍️ Thêm bộ thủ mới</h3>

                <div className={styles.formRow}>
                    <div className={styles.formGroupChar}>
                        <label>Chữ Hán *</label>
                        <input
                            type="text"
                            value={form.character}
                            onChange={(e) => setForm(prev => ({ ...prev, character: e.target.value }))}
                            placeholder="人"
                            className={styles.inputChar}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroupStroke}>
                        <label>Số nét</label>
                        <input
                            type="number"
                            value={form.strokes}
                            onChange={(e) => setForm(prev => ({ ...prev, strokes: e.target.value }))}
                            placeholder="2"
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Tên Hán-Việt</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nhân"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Pinyin</label>
                    <input
                        type="text"
                        value={form.pinyin}
                        onChange={(e) => setForm(prev => ({ ...prev, pinyin: e.target.value }))}
                        placeholder="rén"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Nghĩa</label>
                    <input
                        type="text"
                        value={form.meaning}
                        onChange={(e) => setForm(prev => ({ ...prev, meaning: e.target.value }))}
                        placeholder="Người"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Ví dụ chữ chứa bộ</label>
                    <input
                        type="text"
                        value={form.examples}
                        onChange={(e) => setForm(prev => ({ ...prev, examples: e.target.value }))}
                        placeholder="仁, 你, 他"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formActions}>
                    <button type="button" className={styles.btnCancel} onClick={onClose}>
                        Hủy
                    </button>
                    <button type="submit" className={styles.btnSave} disabled={saving || !form.character.trim()}>
                        {saving ? '⏳ Đang lưu...' : '💾 Lưu'}
                    </button>
                </div>
            </motion.form>
        </motion.div>
    );
};

export default function RadicalFlashcard() {
    const {
        currentCard, currentIndex, isFlipped, mode, learnedIds, reviewIds,
        loading, dailyLearned, studyStreak, activeCards, radicals,
        totalRadicals, learnedCount, reviewCount, remainingCount, progressPercent,
        flipCard, nextCard, prevCard, markAsLearned, markForReview,
        switchMode, resetProgress, addRadical, deleteRadical, seedRadicals,
        showAddForm, setShowAddForm,
    } = useFlashcards();

    const [showGrid, setShowGrid] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [isSeeding, setIsSeeding] = useState(false);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    const handleSwipe = (direction) => {
        if (!currentCard) return;
        setSwipeDirection(direction);
        setTimeout(() => {
            if (direction === 'right') {
                markAsLearned(currentCard.id);
            } else {
                markForReview(currentCard.id);
            }
            setSwipeDirection(null);
        }, 200);
    };

    const getCardStatus = (radicalId) => {
        if (learnedIds.includes(radicalId)) return 'learned';
        if (reviewIds.includes(radicalId)) return 'review';
        return 'new';
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h2>✍️ Bộ thủ</h2>
                <div className={styles.headerActions}>
                    {totalRadicals < 214 && (
                        <button
                            onClick={async () => {
                                if (confirm('Thêm trọn bộ 214 thủ Kangxi chuẩn?')) {
                                    setIsSeeding(true);
                                    await seedRadicals();
                                    setIsSeeding(false);
                                }
                            }}
                            disabled={isSeeding}
                            style={{ 
                                padding: '0.5rem 1rem', 
                                background: 'rgba(255,255,255,0.05)', 
                                color: 'white', 
                                borderRadius: '12px', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                fontSize: '0.9rem', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isSeeding ? '⏳...' : '📚 Import 214'}
                        </button>
                    )}
                    <button
                        className={styles.btnAdd}
                        onClick={() => setShowAddForm(true)}
                    >
                        ➕ Thêm
                    </button>
                    <button
                        className={styles.btnReset}
                        onClick={resetProgress}
                    >
                        🔄 Reset
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {radicals.length === 0 ? (
                <motion.div
                    className={styles.emptyState}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={styles.emptyIcon}>📝</div>
                    <h3>Chưa có bộ thủ nào</h3>
                    <p>Nhấn &quot;➕ Thêm&quot; để bắt đầu nhập bộ thủ bạn đã học</p>
                    <button
                        className={styles.btnAddLarge}
                        onClick={() => setShowAddForm(true)}
                    >
                        ➕ Thêm bộ thủ đầu tiên
                    </button>
                </motion.div>
            ) : (
                <>
                    {/* Mode Tabs */}
                    <div className={styles.modeTabs}>
                        {[
                            { key: 'learn', label: 'Học mới', count: remainingCount },
                            { key: 'review', label: 'Ôn lại', count: reviewCount },
                            { key: 'all', label: 'Tất cả', count: totalRadicals },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`${styles.modeTab} ${mode === tab.key ? styles.modeTabActive : ''}`}
                                onClick={() => switchMode(tab.key)}
                            >
                                {tab.label}
                                <span className={styles.tabBadge}>{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* Progress */}
                    <div className={styles.progressCard}>
                        <div className={styles.progressHeader}>
                            <span>Tiến trình học</span>
                            <span className={styles.progressPercent}>{progressPercent}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <motion.div
                                className={styles.progressFill}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <div className={styles.progressLabels}>
                            <span>✅ {learnedCount} đã nhớ</span>
                            <span>📝 {reviewCount} cần ôn</span>
                            <span>🔲 {remainingCount} chưa học</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className={styles.miniStats}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{learnedCount}</span>
                            <span className={styles.statLabel}>Đã nhớ</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{dailyLearned}</span>
                            <span className={styles.statLabel}>Hôm nay</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>🔥 {studyStreak}</span>
                            <span className={styles.statLabel}>Streak</span>
                        </div>
                    </div>

                    {/* Card Area */}
                    {activeCards.length > 0 ? (
                        <>
                            <motion.div
                                className={`${styles.cardContainer} ${swipeDirection ? styles[`swipe${swipeDirection === 'right' ? 'Right' : 'Left'}`] : ''}`}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.3}
                                onDragEnd={(e, info) => {
                                    if (info.offset.x > 80) handleSwipe('right');
                                    else if (info.offset.x < -80) handleSwipe('left');
                                }}
                                onClick={flipCard}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentCard?.id + (isFlipped ? '-back' : '-front')}
                                        className={styles.card}
                                        initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                                        animate={{ rotateY: 0, opacity: 1 }}
                                        exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {!isFlipped ? (
                                            <div className={styles.cardFront}>
                                                <span className={styles.cardCharacter}>
                                                    {currentCard?.character}
                                                </span>
                                                {currentCard?.strokes > 0 && (
                                                    <span className={styles.cardStrokes}>
                                                        ✍️ {currentCard.strokes} nét
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={styles.cardBack}>
                                                <span className={styles.cardCharacterSmall}>
                                                    {currentCard?.character}
                                                </span>
                                                {currentCard?.name && (
                                                    <h3 className={styles.cardName}>{currentCard.name}</h3>
                                                )}
                                                {currentCard?.pinyin && (
                                                    <p className={styles.cardPinyin}>{currentCard.pinyin}</p>
                                                )}
                                                {currentCard?.meaning && (
                                                    <p className={styles.cardMeaning}>
                                                        {currentCard.meaning}
                                                    </p>
                                                )}
                                                {currentCard?.examples && (
                                                    <div className={styles.cardExamples}>
                                                        <span className={styles.exampleLabel}>Ví dụ:</span>
                                                        <span>{currentCard.examples}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                                <p className={styles.cardHint}>
                                    Nhấn để lật • Vuốt phải = Nhớ
                                </p>
                            </motion.div>

                            {/* Navigation & Actions */}
                            <div className={styles.cardActions}>
                                <button className={styles.btnNav} onClick={prevCard}>
                                    ◀
                                </button>
                                <button
                                    className={styles.btnReview}
                                    onClick={() => currentCard && markForReview(currentCard.id)}
                                >
                                    📝 Ôn lại
                                </button>
                                <button
                                    className={styles.btnLearned}
                                    onClick={() => currentCard && markAsLearned(currentCard.id)}
                                >
                                    ✅ Nhớ rồi
                                </button>
                                <button className={styles.btnNav} onClick={nextCard}>
                                    ▶
                                </button>
                            </div>

                            <p className={styles.cardCounter}>
                                {currentIndex + 1} / {activeCards.length}
                            </p>
                        </>
                    ) : (
                        <div className={styles.emptyCards}>
                            <p>
                                {mode === 'learn' ? '🎉 Bạn đã học hết tất cả bộ thủ!' :
                                    mode === 'review' ? '✅ Không có bộ thủ nào cần ôn lại!' :
                                        'Chưa có bộ thủ nào.'}
                            </p>
                        </div>
                    )}

                    {/* Grid Toggle */}
                    <button
                        className={styles.btnGridToggle}
                        onClick={() => setShowGrid(!showGrid)}
                    >
                        {showGrid ? '🎴 Ẩn tổng quan' : '📖 Xem tổng quan'}
                    </button>

                    {/* Grid Overview */}
                    <AnimatePresence>
                        {showGrid && (
                            <motion.div
                                className={styles.gridContainer}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                            >
                                <div className={styles.grid}>
                                    {radicals.map(radical => (
                                        <div
                                            key={radical.id}
                                            className={`${styles.gridItem} ${styles[getCardStatus(radical.id)]}`}
                                            title={`${radical.name || ''} - ${radical.meaning || ''}`}
                                        >
                                            <span className={styles.gridChar}>{radical.character}</span>
                                            <button
                                                className={styles.btnDelete}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Xóa bộ thủ này?')) {
                                                        deleteRadical(radical.id);
                                                    }
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* Add Form Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <AddRadicalForm
                        onAdd={addRadical}
                        onClose={() => setShowAddForm(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
