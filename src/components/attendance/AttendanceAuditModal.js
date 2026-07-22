'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './AttendanceAuditModal.module.css';

export default function AttendanceAuditModal({ auditData, onClose, loading }) {
    const [activeTab, setActiveTab] = useState('summary');

    if (!auditData && loading) {
        return (
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.loadingState}>
                        <FontAwesomeIcon icon="spinner" spin size="2x" />
                        <p>Đang kiểm toán và đối soát dữ liệu Attendance...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!auditData) return null;

    const {
        totalDocs,
        checkedInCount,
        uniqueCheckedInCount,
        firstRecordedDate,
        lastRecordedDate,
        invalidDocIds,
        mismatchedDates,
        makeupCheckIns,
        byYearMonth,
        currentStreak,
        longestStreak,
        discrepancy
    } = auditData;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h3>🔍 Kiểm tra & Đối soát Dữ liệu Check-in</h3>
                        <p className={styles.subtitle}>Phân tích chi tiết toàn bộ collection Firestore Attendance</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FontAwesomeIcon icon="xmark" />
                    </button>
                </div>

                <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>📅 Ngày Đầu Tiên Ghi Data</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#38BDF8', marginTop: '0.1rem' }}>{firstRecordedDate || 'Chưa có dữ liệu'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>📅 Ngày Ghi Gần Nhất</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#A7F3D0', marginTop: '0.1rem' }}>{lastRecordedDate || 'Chưa có dữ liệu'}</div>
                    </div>
                </div>

                <div className={styles.summaryGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Tổng Document</span>
                        <span className={styles.statValue}>{totalDocs}</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.highlight}`}>
                        <span className={styles.statLabel}>Số Ngày Thật (Unique)</span>
                        <span className={styles.statValue}>{uniqueCheckedInCount}</span>
                        <span className={styles.subText}>Số 154 chuẩn công nhận</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Chuỗi Hiện Tại</span>
                        <span className={styles.statValue}>{currentStreak} ngày</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Chuỗi Dài Nhất</span>
                        <span className={styles.statValue}>{longestStreak} ngày</span>
                    </div>
                </div>

                <div className={styles.tabNav}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'summary' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('summary')}
                    >
                        Theo Tháng ({Object.keys(byYearMonth).length})
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'issues' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('issues')}
                    >
                        Báo Cáo Bất Thường ({invalidDocIds.length + mismatchedDates.length})
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'makeup' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('makeup')}
                    >
                        Check-in Bù ({makeupCheckIns.length})
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'summary' && (
                        <div className={styles.monthlyList}>
                            {Object.entries(byYearMonth).sort(([a], [b]) => b.localeCompare(a)).map(([ym, count]) => (
                                <div key={ym} className={styles.monthlyItem}>
                                    <span className={styles.monthName}>Tháng {ym}</span>
                                    <span className={styles.monthBadge}>{count} ngày checked-in</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'issues' && (
                        <div className={styles.issuesList}>
                            {invalidDocIds.length === 0 && mismatchedDates.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <FontAwesomeIcon icon="circle-check" color="#10B981" size="2x" />
                                    <p>Không phát hiện ID sai format hoặc ngày mâu thuẫn!</p>
                                </div>
                            ) : (
                                <>
                                    {invalidDocIds.map((item, i) => (
                                        <div key={i} className={styles.issueItem}>
                                            <span className={styles.issueTag}>ID Sai Định Dạng</span>
                                            <code>{item.id}</code>
                                        </div>
                                    ))}
                                    {mismatchedDates.map((item, i) => (
                                        <div key={i} className={styles.issueItem}>
                                            <span className={styles.issueTag}>Mâu Thuẫn Field Date</span>
                                            <span>Doc ID: <code>{item.id}</code> vs Field: <code>{item.fieldDate}</code></span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'makeup' && (
                        <div className={styles.makeupList}>
                            {makeupCheckIns.length === 0 ? (
                                <p className={styles.emptyText}>Không có ngày check-in bù/thủ công.</p>
                            ) : (
                                makeupCheckIns.map((item, i) => (
                                    <div key={i} className={styles.makeupItem}>
                                        <span>📅 Ngày {item.id}</span>
                                        <span className={styles.makeupBadge}>Check-in Bù</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.confirmBtn} onClick={onClose}>
                        Đã Hiểu & Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
