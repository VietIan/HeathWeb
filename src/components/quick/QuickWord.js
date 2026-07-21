'use client';

import { useState, useCallback } from 'react';
import { useQuickWords } from '@/lib/hooks/useQuickWords';
import { Zap, Plus, List, BarChart3, RefreshCw, Search, Trash2, Eye, EyeOff, BookOpen, X } from 'lucide-react';
import styles from './QuickWord.module.css';

const TABS = [
    { id: 'add', label: 'Thêm', icon: Plus },
    { id: 'list', label: 'Danh sách', icon: List },
    { id: 'stats', label: 'Thống kê', icon: BarChart3 },
    { id: 'review', label: 'Ôn tập', icon: RefreshCw },
];

function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
}

export default function QuickWord() {
    const {
        loading, searchQuery, setSearchQuery,
        filteredWords, stats, addWord, deleteWord, getRandomWord, totalCount,
    } = useQuickWords();

    const [activeTab, setActiveTab] = useState('add');
    const [word, setWord] = useState('');
    const [meaning, setMeaning] = useState('');
    const [wordType, setWordType] = useState('word');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [reviewWord, setReviewWord] = useState(null);
    const [showMeaning, setShowMeaning] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // ============ ADD TAB ============
    const handleQuickSave = useCallback(async () => {
        if (!word.trim()) return;
        try {
            await addWord(word, meaning, wordType);
            setWord('');
            setMeaning('');
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
            console.error(err);
        }
    }, [word, meaning, wordType, addWord]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleQuickSave();
        }
    };

    // ============ REVIEW TAB ============
    const handleNextReview = useCallback(() => {
        setShowMeaning(false);
        setReviewWord(getRandomWord());
    }, [getRandomWord]);

    // ============ DELETE ============
    const handleDelete = useCallback(async (id) => {
        await deleteWord(id);
        setDeleteConfirm(null);
    }, [deleteWord]);

    // Auto-detect type
    const detectType = useCallback((val) => {
        setWord(val);
        // If more than 4 chars or contains spaces, likely a sentence
        if (val.length > 4 || val.includes(' ')) {
            setWordType('sentence');
        } else {
            setWordType('word');
        }
    }, []);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Zap className={styles.loadingIcon} size={32} />
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}>
                        <Zap size={22} />
                    </div>
                    <div>
                        <h2 className={styles.title}>Quick</h2>
                        <p className={styles.subtitle}>Học thụ động • {totalCount} từ đã lưu</p>
                    </div>
                </div>
            </div>

            {/* Tab Bar */}
            <div className={styles.tabBar}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id === 'review') handleNextReview();
                            }}
                        >
                            <Icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>

                {/* ===== ADD TAB ===== */}
                {activeTab === 'add' && (
                    <div className={styles.addTab}>
                        <div className={styles.addCard}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Từ / Câu tiếng Trung</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="好久不见"
                                    value={word}
                                    onChange={(e) => detectType(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Nghĩa tiếng Việt</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="lâu không gặp"
                                    value={meaning}
                                    onChange={(e) => setMeaning(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>

                            <div className={styles.typeToggle}>
                                <button
                                    className={`${styles.typeBtn} ${wordType === 'word' ? styles.typeBtnActive : ''}`}
                                    onClick={() => setWordType('word')}
                                >
                                    📝 Từ
                                </button>
                                <button
                                    className={`${styles.typeBtn} ${wordType === 'sentence' ? styles.typeBtnActive : ''}`}
                                    onClick={() => setWordType('sentence')}
                                >
                                    💬 Câu
                                </button>
                            </div>

                            <button
                                className={`${styles.saveBtn} ${saveSuccess ? styles.saveBtnSuccess : ''}`}
                                onClick={handleQuickSave}
                                disabled={!word.trim()}
                            >
                                {saveSuccess ? (
                                    <>✅ Đã lưu!</>
                                ) : (
                                    <><Zap size={18} /> Quick Save</>
                                )}
                            </button>

                            <p className={styles.hint}>
                                💡 Nhấn <kbd>Ctrl</kbd>+<kbd>Enter</kbd> để lưu nhanh
                            </p>
                        </div>
                    </div>
                )}

                {/* ===== LIST TAB ===== */}
                {activeTab === 'list' && (
                    <div className={styles.listTab}>
                        <div className={styles.searchBar}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Tìm kiếm từ hoặc nghĩa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className={styles.searchClear} onClick={() => setSearchQuery('')}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {filteredWords.length === 0 ? (
                            <div className={styles.emptyState}>
                                <BookOpen size={40} className={styles.emptyIcon} />
                                <p>{searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có từ nào. Bắt đầu thêm từ mới!'}</p>
                            </div>
                        ) : (
                            <div className={styles.wordGroups}>
                                {filteredWords.map(group => (
                                    <div key={group.date} className={styles.dateGroup}>
                                        <div className={styles.dateHeader}>
                                            <span className={styles.dateBadge}>{formatDate(group.date)}</span>
                                            <span className={styles.dateCount}>{group.items.length} từ</span>
                                        </div>
                                        <div className={styles.wordList}>
                                            {group.items.map(item => (
                                                <div key={item.id} className={styles.wordItem}>
                                                    <div className={styles.wordContent}>
                                                        <span className={styles.wordChinese}>{item.word}</span>
                                                        <span className={styles.wordMeaning}>{item.meaning}</span>
                                                    </div>
                                                    <div className={styles.wordMeta}>
                                                        <span className={styles.wordType}>
                                                            {item.type === 'sentence' ? '💬' : '📝'}
                                                        </span>
                                                        {deleteConfirm === item.id ? (
                                                            <div className={styles.deleteConfirm}>
                                                                <button className={styles.deleteYes} onClick={() => handleDelete(item.id)}>Xoá</button>
                                                                <button className={styles.deleteNo} onClick={() => setDeleteConfirm(null)}>Huỷ</button>
                                                            </div>
                                                        ) : (
                                                            <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(item.id)}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== STATS TAB ===== */}
                {activeTab === 'stats' && (
                    <div className={styles.statsTab}>
                        <div className={styles.statsGrid}>
                            <div className={`${styles.statCard} ${styles.statWeek}`}>
                                <div className={styles.statIcon}>📅</div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statLabel}>Tuần này</span>
                                    <span className={styles.statValue}>{stats.weekTotal}</span>
                                    <span className={styles.statDetail}>
                                        {stats.weekWords} từ • {stats.weekSentences} câu
                                    </span>
                                </div>
                            </div>

                            <div className={`${styles.statCard} ${styles.statMonth}`}>
                                <div className={styles.statIcon}>📆</div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statLabel}>Tháng {new Date().getMonth() + 1}</span>
                                    <span className={styles.statValue}>{stats.monthTotal}</span>
                                    <span className={styles.statDetail}>
                                        {stats.monthWords} từ • {stats.monthSentences} câu
                                    </span>
                                </div>
                            </div>

                            <div className={`${styles.statCard} ${styles.statTotal}`}>
                                <div className={styles.statIcon}>🏆</div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statLabel}>Tổng đã lưu</span>
                                    <span className={styles.statValue}>{stats.total}</span>
                                    <span className={styles.statDetail}>
                                        {stats.totalWords} từ • {stats.totalSentences} câu
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== REVIEW TAB ===== */}
                {activeTab === 'review' && (
                    <div className={styles.reviewTab}>
                        {reviewWord ? (
                            <div className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <span className={styles.reviewIcon}>🔄</span>
                                    <span>Ôn hôm nay</span>
                                </div>

                                <div className={styles.reviewWord}>
                                    {reviewWord.word}
                                </div>

                                <p className={styles.reviewPrompt}>
                                    Bạn nhớ nghĩa không?
                                </p>

                                {showMeaning ? (
                                    <div className={styles.reviewMeaning}>
                                        <span>{reviewWord.meaning}</span>
                                    </div>
                                ) : (
                                    <button
                                        className={styles.revealBtn}
                                        onClick={() => setShowMeaning(true)}
                                    >
                                        <Eye size={16} /> Hiện nghĩa
                                    </button>
                                )}

                                <button
                                    className={styles.nextBtn}
                                    onClick={handleNextReview}
                                >
                                    Từ tiếp theo →
                                </button>
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <RefreshCw size={40} className={styles.emptyIcon} />
                                <p>Chưa có từ nào để ôn. Hãy thêm từ mới trước!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
