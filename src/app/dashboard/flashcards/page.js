'use client';

import { useState } from 'react';
import { useHSK2Vocabulary } from '@/lib/hooks/useHSK2Vocabulary';
import HSK2QuickInput from '@/components/flashcards/HSK2QuickInput';
import HSK2BulkImportModal from '@/components/flashcards/HSK2BulkImportModal';
import HSK2StudySession from '@/components/flashcards/HSK2StudySession';
import RadicalFlashcard from '@/components/flashcards/RadicalFlashcard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './page.module.css';

export default function FlashcardsPage() {
    const {
        vocabList,
        loading,
        todayReviewQueue,
        stats,
        saveVocabItem,
        bulkImportVocab,
        reviewWord,
        deleteWord
    } = useHSK2Vocabulary();

    const [tab, setTab] = useState('hsk2'); // 'hsk2' | 'radicals'
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'study'
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'new' | 'learning' | 'mastered'

    const filteredVocab = vocabList.filter(item => {
        const matchesSearch = !searchTerm ||
            item.hanzi?.includes(searchTerm) ||
            item.pinyin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.meaningVi?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || item.learningStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (viewMode === 'study') {
        return (
            <div className={styles.container}>
                <HSK2StudySession
                    queue={todayReviewQueue}
                    onReviewWord={reviewWord}
                    onFinishSession={() => setViewMode('list')}
                />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>📚 Học Từ Vựng HSK2 & Bộ Thủ</h1>
                    <p className={styles.subtitle}>Nhập liệu nhanh, import hàng loạt, ôn tập lặp lại ngắt quãng (SRS)</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={`${styles.tabBtn} ${tab === 'hsk2' ? styles.activeTab : ''}`}
                        onClick={() => setTab('hsk2')}
                    >
                        Từ vựng HSK2 ({stats.total})
                    </button>
                    <button
                        className={`${styles.tabBtn} ${tab === 'radicals' ? styles.activeTab : ''}`}
                        onClick={() => setTab('radicals')}
                    >
                        214 Bộ thủ
                    </button>
                </div>
            </header>

            {tab === 'radicals' ? (
                <RadicalFlashcard />
            ) : (
                <>
                    {/* Real Study Queue Stats */}
                    <div className={styles.statsRow}>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Tổng Số Từ HSK2</span>
                            <span className={styles.statVal}>{stats.total}</span>
                        </div>
                        <div className={`${styles.statCard} ${styles.queueHighlight}`}>
                            <span className={styles.statLabel}>Cần Ôn Hôm Nay</span>
                            <span className={styles.statVal}>{stats.todayQueueCount}</span>
                            <button
                                className={styles.startStudyBtn}
                                onClick={() => setViewMode('study')}
                                disabled={stats.todayQueueCount === 0}
                            >
                                🎯 Bắt Đầu Ôn ({stats.todayQueueCount})
                            </button>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Đang Học</span>
                            <span className={styles.statVal}>{stats.learningCount}</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Đã Thuộc</span>
                            <span className={styles.statVal}>{stats.masteredCount}</span>
                        </div>
                    </div>

                    {/* Quick Input Component */}
                    <HSK2QuickInput onSaveItem={saveVocabItem} />

                    {/* Filter & Import Bar */}
                    <div className={styles.toolbar}>
                        <div className={styles.searchBox}>
                            <FontAwesomeIcon icon="magnifying-glass" className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Tìm theo Chữ Hán, Pinyin, Nghĩa Việt..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className={styles.toolbarRight}>
                            <select
                                className={styles.statusSelect}
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái ({vocabList.length})</option>
                                <option value="new">Từ mới ({stats.newCount})</option>
                                <option value="learning">Đang học ({stats.learningCount})</option>
                                <option value="mastered">Đã thuộc ({stats.masteredCount})</option>
                            </select>

                            <button
                                className={styles.bulkImportBtn}
                                onClick={() => setShowBulkImport(true)}
                            >
                                <FontAwesomeIcon icon="file-import" /> Import HSK2 Hàng Loạt
                            </button>
                        </div>
                    </div>

                    {/* Vocabulary List */}
                    {loading ? (
                        <div className={styles.loading}>Đang tải danh sách từ vựng HSK2...</div>
                    ) : filteredVocab.length === 0 ? (
                        <div className={styles.emptyList}>
                            <FontAwesomeIcon icon="book-open" size="2x" color="#64748B" />
                            <p>Chưa có từ vựng nào phù hợp. Hãy dán dòng nhập nhanh hoặc Import danh sách!</p>
                        </div>
                    ) : (
                        <div className={styles.vocabGrid}>
                            {filteredVocab.map((item) => (
                                <div key={item.id} className={styles.vocabCard}>
                                    <div className={styles.cardHeader}>
                                        <span className={styles.sourceTag}>#{item.sourceIndex || 'HSK2'}</span>
                                        <div className={styles.cardRight}>
                                            <span className={`${styles.statusBadge} ${styles[item.learningStatus || 'new']}`}>
                                                {item.learningStatus === 'mastered' ? 'Đã thuộc' : item.learningStatus === 'learning' ? 'Đang học' : 'Từ mới'}
                                            </span>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => deleteWord(item.id)}
                                                title="Xóa từ"
                                            >
                                                <FontAwesomeIcon icon="trash" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.hanziMain}>{item.hanzi}</div>
                                    <div className={styles.pinyinSub}>{item.pinyin}</div>
                                    {item.hanViet && <div className={styles.hanVietSub}>[{item.hanViet}]</div>}
                                    <div className={styles.meaningMain}>{item.meaningVi}</div>
                                    {item.meaningEn && <div className={styles.meaningEnSub}>{item.meaningEn}</div>}
                                    {item.exampleZh && (
                                        <div className={styles.exampleBox}>
                                            <p className={styles.exZh}>{item.exampleZh}</p>
                                            <p className={styles.exVi}>{item.exampleVi}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Bulk Import Modal */}
                    {showBulkImport && (
                        <HSK2BulkImportModal
                            onClose={() => setShowBulkImport(false)}
                            onConfirmImport={bulkImportVocab}
                        />
                    )}
                </>
            )}
        </div>
    );
}
