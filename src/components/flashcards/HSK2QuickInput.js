'use client';

import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { parseHSKLine } from '@/lib/utils/hskParser';
import styles from './HSK2QuickInput.module.css';

export default function HSK2QuickInput({ onSaveItem }) {
    const [mode, setMode] = useState('fast'); // 'fast' | 'detailed'
    const [fastLine, setFastLine] = useState('');
    const [parsedPreview, setParsedPreview] = useState(null);

    // Detailed Form State
    const [formData, setFormData] = useState({
        hanzi: '',
        pinyin: '',
        hanViet: '',
        meaningVi: '',
        meaningEn: '',
        partOfSpeech: '',
        usageNote: '',
        exampleZh: '',
        exampleVi: '',
        hskLevel: 2,
        tags: 'HSK2'
    });

    const hanziInputRef = useRef(null);

    // Handle fast line input change
    const handleFastChange = (e) => {
        const val = e.target.value;
        setFastLine(val);
        if (val.trim()) {
            const parsed = parseHSKLine(val);
            setParsedPreview(parsed);
        } else {
            setParsedPreview(null);
        }
    };

    // Save fast line
    const handleSaveFast = async () => {
        if (!parsedPreview || !parsedPreview.hanzi) return;
        await onSaveItem(parsedPreview);
        setFastLine('');
        setParsedPreview(null);
    };

    // Handle Detailed Form submit
    const handleDetailedSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!formData.hanzi.trim() || !formData.meaningVi.trim()) return;

        const payload = {
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        await onSaveItem(payload);

        // Reset form and focus back on Hanzi
        setFormData({
            hanzi: '',
            pinyin: '',
            hanViet: '',
            meaningVi: '',
            meaningEn: '',
            partOfSpeech: '',
            usageNote: '',
            exampleZh: '',
            exampleVi: '',
            hskLevel: 2,
            tags: 'HSK2'
        });

        if (hanziInputRef.current) {
            hanziInputRef.current.focus();
        }
    };

    // Handle Ctrl + Enter shortcut
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (mode === 'fast') {
                handleSaveFast();
            } else {
                handleDetailedSubmit();
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.modeHeader}>
                <div className={styles.modeToggle}>
                    <button
                        type="button"
                        className={`${styles.modeBtn} ${mode === 'fast' ? styles.activeMode : ''}`}
                        onClick={() => setMode('fast')}
                    >
                        ⚡ Nhập Siêu Nhanh (1 Dòng)
                    </button>
                    <button
                        type="button"
                        className={`${styles.modeBtn} ${mode === 'detailed' ? styles.activeMode : ''}`}
                        onClick={() => setMode('detailed')}
                    >
                        📝 Form Chi Tiết (Full Field)
                    </button>
                </div>
                <span className={styles.shortcutBadge}>Phím tắt: Ctrl + Enter để Lưu nhanh</span>
            </div>

            {mode === 'fast' ? (
                <div className={styles.fastSection}>
                    <div className={styles.inputGroup}>
                        <textarea
                            className={styles.fastInput}
                            rows={3}
                            placeholder="Dán hoặc nhập dòng từ vựng: 86：多数 % duōshù — [ĐA SỐ] — [Majority / Most]: Đa số, phần lớn..."
                            value={fastLine}
                            onChange={handleFastChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {parsedPreview && (
                        <div className={styles.previewCard}>
                            <div className={styles.previewTitle}>
                                <FontAwesomeIcon icon="eye" /> Xem Trước Kết Quả Phân Tích
                            </div>
                            <div className={styles.previewGrid}>
                                <div><span className={styles.label}>STT:</span> #{parsedPreview.sourceIndex}</div>
                                <div><span className={styles.label}>Chữ Hán:</span> <strong className={styles.hanziText}>{parsedPreview.hanzi}</strong></div>
                                <div><span className={styles.label}>Pinyin:</span> {parsedPreview.pinyin}</div>
                                <div><span className={styles.label}>Hán Việt:</span> {parsedPreview.hanViet}</div>
                                <div><span className={styles.label}>Nghĩa Việt:</span> {parsedPreview.meaningVi}</div>
                                <div><span className={styles.label}>Nghĩa Anh:</span> {parsedPreview.meaningEn}</div>
                                {parsedPreview.exampleZh && (
                                    <div className={styles.fullWidth}>
                                        <span className={styles.label}>Ví dụ:</span> {parsedPreview.exampleZh} ({parsedPreview.exampleVi})
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.actionRow}>
                        <button
                            type="button"
                            className={styles.saveBtn}
                            onClick={handleSaveFast}
                            disabled={!parsedPreview || !parsedPreview.hanzi}
                        >
                            <FontAwesomeIcon icon="plus" /> Lưu Từ Này
                        </button>
                    </div>
                </div>
            ) : (
                <form className={styles.detailedForm} onSubmit={handleDetailedSubmit} onKeyDown={handleKeyDown}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Chữ Hán <span className={styles.required}>*</span></label>
                            <input
                                ref={hanziInputRef}
                                type="text"
                                placeholder="VD: 多数"
                                required
                                value={formData.hanzi}
                                onChange={e => setFormData({ ...formData, hanzi: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Pinyin</label>
                            <input
                                type="text"
                                placeholder="VD: duōshù"
                                value={formData.pinyin}
                                onChange={e => setFormData({ ...formData, pinyin: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Hán Việt</label>
                            <input
                                type="text"
                                placeholder="VD: ĐA SỐ"
                                value={formData.hanViet}
                                onChange={e => setFormData({ ...formData, hanViet: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Nghĩa Tiếng Việt <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                placeholder="VD: Đa số, phần lớn"
                                required
                                value={formData.meaningVi}
                                onChange={e => setFormData({ ...formData, meaningVi: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Nghĩa Tiếng Anh</label>
                            <input
                                type="text"
                                placeholder="VD: Majority / Most"
                                value={formData.meaningEn}
                                onChange={e => setFormData({ ...formData, meaningEn: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Từ loại (POS)</label>
                            <input
                                type="text"
                                placeholder="VD: Noun, Verb..."
                                value={formData.partOfSpeech}
                                onChange={e => setFormData({ ...formData, partOfSpeech: e.target.value })}
                            />
                        </div>
                        <div className={styles.fullWidthGroup}>
                            <label>Ví dụ Tiếng Trung</label>
                            <input
                                type="text"
                                placeholder="VD: 多数人同意这个意见。"
                                value={formData.exampleZh}
                                onChange={e => setFormData({ ...formData, exampleZh: e.target.value })}
                            />
                        </div>
                        <div className={styles.fullWidthGroup}>
                            <label>Dịch Ví dụ Tiếng Việt</label>
                            <input
                                type="text"
                                placeholder="VD: Đa số mọi người đồng ý ý kiến này."
                                value={formData.exampleVi}
                                onChange={e => setFormData({ ...formData, exampleVi: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.actionRow}>
                        <button type="submit" className={styles.saveBtn} disabled={!formData.hanzi || !formData.meaningVi}>
                            <FontAwesomeIcon icon="floppy-disk" /> Lưu Từ (Ctrl + Enter)
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
