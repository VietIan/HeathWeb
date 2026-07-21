'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Send, Inbox, Zap } from 'lucide-react';
import styles from './BrainDump.module.css';

export default function BrainDump({ isOpen, onClose, onAddItem }) {
    const [input, setInput] = useState('');
    const [recentItems, setRecentItems] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Escape to close
            if (e.key === 'Escape' && isOpen) {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSubmit = useCallback((e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const item = {
            id: Date.now().toString(),
            text: input.trim(),
            createdAt: new Date().toISOString(),
            type: 'inbox', // Will be classified later
        };

        onAddItem?.(item);
        setRecentItems((prev) => [item, ...prev.slice(0, 4)]);
        setInput('');

        // Keep focus on input
        inputRef.current?.focus();
    }, [input, onAddItem]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.container} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerIcon}>
                        <Zap size={20} />
                    </div>
                    <div>
                        <h3>Brain Dump</h3>
                        <p>Gõ nhanh mọi thứ trong đầu</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập ý tưởng, task, ghi chú..."
                        className={styles.input}
                        autoComplete="off"
                    />
                    <button type="submit" className={styles.submitBtn} disabled={!input.trim()}>
                        <Send size={18} />
                    </button>
                </form>

                {recentItems.length > 0 && (
                    <div className={styles.recentItems}>
                        <span className={styles.recentLabel}>
                            <Inbox size={14} />
                            Vừa thêm
                        </span>
                        <div className={styles.itemsList}>
                            {recentItems.map((item) => (
                                <div key={item.id} className={styles.itemChip}>
                                    {item.text.length > 30 ? `${item.text.slice(0, 30)}...` : item.text}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.hint}>
                    <span>💡</span>
                    <span>Nhấn <kbd>Enter</kbd> để thêm nhanh • <kbd>Esc</kbd> để đóng</span>
                </div>
            </div>
        </div>
    );
}
