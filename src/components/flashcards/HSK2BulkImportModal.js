'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { parseBatchHSKText } from '@/lib/utils/hskParser';
import styles from './HSK2BulkImportModal.module.css';

export default function HSK2BulkImportModal({ onClose, onConfirmImport }) {
    const [rawText, setRawText] = useState('');
    const [previewResult, setPreviewResult] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importSummary, setImportSummary] = useState(null);

    const handleTextChange = (e) => {
        const text = e.target.value;
        setRawText(text);
        if (text.trim()) {
            const parsed = parseBatchHSKText(text);
            setPreviewResult(parsed);
        } else {
            setPreviewResult(null);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            if (typeof content === 'string') {
                setRawText(content);
                const parsed = parseBatchHSKText(content);
                setPreviewResult(parsed);
            }
        };
        reader.readAsText(file, 'UTF-8');
    };

    const handleImport = async () => {
        if (!rawText.trim()) return;
        setIsImporting(true);
        try {
            const res = await onConfirmImport(rawText);
            setImportSummary(res);
        } catch (err) {
            console.error('Import error:', err);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h3>📥 Import HSK2 Hàng Loạt</h3>
                        <p className={styles.subtitle}>Tải file hsk2.txt hoặc dán toàn bộ danh sách từ vựng</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FontAwesomeIcon icon="xmark" />
                    </button>
                </div>

                {importSummary ? (
                    <div className={styles.summaryContainer}>
                        <div className={styles.successBadge}>
                            <FontAwesomeIcon icon="circle-check" size="2x" color="#10B981" />
                            <h4>Nhập HSK2 Hoàn Tất!</h4>
                        </div>
                        <div className={styles.summaryStats}>
                            <div><span>Số từ đã thêm:</span> <strong>{importSummary.importedCount}</strong></div>
                            <div><span>Bỏ qua do đã có:</span> <strong>{importSummary.skippedCount || 0}</strong></div>
                            <div><span>Mục lỗi/thiếu:</span> <strong>{importSummary.errors?.length || 0}</strong></div>
                        </div>
                        <button className={styles.confirmBtn} onClick={onClose}>
                            Đóng & Bắt Đầu Học
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.uploadRow}>
                            <label className={styles.fileUploadBtn}>
                                <FontAwesomeIcon icon="file-arrow-up" /> chọn File .txt (hsk2.txt)
                                <input type="file" accept=".txt" onChange={handleFileUpload} hidden />
                            </label>
                            <span className={styles.orText}>Hoặc dán trực tiếp vào bên dưới</span>
                        </div>

                        <textarea
                            className={styles.textArea}
                            rows={8}
                            placeholder="Dán dữ liệu hàng loạt vào đây..."
                            value={rawText}
                            onChange={handleTextChange}
                        />

                        {previewResult && (
                            <div className={styles.previewSection}>
                                <div className={styles.previewStats}>
                                    <span className={styles.validTag}>
                                        ✓ {previewResult.validItems.length} từ hợp lệ
                                    </span>
                                    {previewResult.errors.length > 0 && (
                                        <span className={styles.errorTag}>
                                            ⚠ {previewResult.errors.length} dòng lỗi
                                        </span>
                                    )}
                                </div>

                                <div className={styles.tableWrapper}>
                                    <table className={styles.previewTable}>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Chữ Hán</th>
                                                <th>Pinyin</th>
                                                <th>Hán Việt</th>
                                                <th>Nghĩa Tiếng Việt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewResult.validItems.slice(0, 10).map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.sourceIndex}</td>
                                                    <td><strong>{item.hanzi}</strong></td>
                                                    <td>{item.pinyin}</td>
                                                    <td>{item.hanViet}</td>
                                                    <td>{item.meaningVi}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {previewResult.validItems.length > 10 && (
                                        <p className={styles.moreText}>
                                            ... và {previewResult.validItems.length - 10} từ nữa.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className={styles.footer}>
                            <button className={styles.cancelBtn} onClick={onClose}>
                                Hủy Bỏ
                            </button>
                            <button
                                className={styles.importBtn}
                                onClick={handleImport}
                                disabled={!previewResult || previewResult.validItems.length === 0 || isImporting}
                            >
                                {isImporting ? 'Đang Import...' : `Xác Nhận Import (${previewResult?.validItems?.length || 0} từ)`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
