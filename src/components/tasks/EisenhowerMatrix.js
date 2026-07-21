'use client';

import { useState } from 'react';
import { AlertTriangle, Clock, Users, Trash2, GripVertical } from 'lucide-react';
import styles from './EisenhowerMatrix.module.css';

const QUADRANTS = [
    {
        id: 'urgent-important',
        title: 'Làm ngay',
        subtitle: 'Quan trọng & Khẩn cấp',
        icon: AlertTriangle,
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    {
        id: 'not-urgent-important',
        title: 'Lên lịch',
        subtitle: 'Quan trọng & Không khẩn',
        icon: Clock,
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
        id: 'urgent-not-important',
        title: 'Ủy quyền/Làm nhanh',
        subtitle: 'Không quan trọng & Khẩn',
        icon: Users,
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
        id: 'not-urgent-not-important',
        title: 'Xóa/Làm sau',
        subtitle: 'Không quan trọng & Không khẩn',
        icon: Trash2,
        color: '#6B7280',
        bgColor: 'rgba(107, 114, 128, 0.1)',
    },
];

export default function EisenhowerMatrix({ tasks, onUpdateTask, onTaskClick }) {
    const [draggedTask, setDraggedTask] = useState(null);

    const getTasksForQuadrant = (quadrantId) => {
        return tasks.filter(task => {
            const urgency = task.urgency || 'not-urgent';
            const importance = task.importance || 'not-important';

            const taskQuadrant = `${urgency}-${importance}`;
            return taskQuadrant === quadrantId && !task.completed;
        });
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, quadrantId) => {
        e.preventDefault();
        if (!draggedTask) return;

        const [urgency, importance] = quadrantId.split('-').reduce((acc, part, i) => {
            if (i < 2) {
                acc[0] = i === 0 ? part : acc[0];
                acc[1] = i >= 2 || (i === 1 && part === 'important') ? part : acc[1];
            }
            return acc;
        }, ['', '']);

        // Parse quadrant to urgency/importance
        let newUrgency, newImportance;
        if (quadrantId === 'urgent-important') {
            newUrgency = 'urgent';
            newImportance = 'important';
        } else if (quadrantId === 'not-urgent-important') {
            newUrgency = 'not-urgent';
            newImportance = 'important';
        } else if (quadrantId === 'urgent-not-important') {
            newUrgency = 'urgent';
            newImportance = 'not-important';
        } else {
            newUrgency = 'not-urgent';
            newImportance = 'not-important';
        }

        onUpdateTask(draggedTask.id, {
            urgency: newUrgency,
            importance: newImportance
        });
        setDraggedTask(null);
    };

    const getEnergyBadge = (energy) => {
        const badges = {
            high: { emoji: '⚡', label: 'Cao' },
            medium: { emoji: '🔋', label: 'TB' },
            low: { emoji: '🌱', label: 'Thấp' },
        };
        return badges[energy] || null;
    };

    return (
        <div className={styles.matrixContainer}>
            <div className={styles.matrix}>
                {QUADRANTS.map((quadrant) => {
                    const Icon = quadrant.icon;
                    const quadrantTasks = getTasksForQuadrant(quadrant.id);

                    return (
                        <div
                            key={quadrant.id}
                            className={styles.quadrant}
                            style={{
                                '--quadrant-color': quadrant.color,
                                '--quadrant-bg': quadrant.bgColor,
                            }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, quadrant.id)}
                        >
                            <div className={styles.quadrantHeader}>
                                <Icon size={18} style={{ color: quadrant.color }} />
                                <div>
                                    <h4>{quadrant.title}</h4>
                                    <span className={styles.subtitle}>{quadrant.subtitle}</span>
                                </div>
                                <span className={styles.count}>{quadrantTasks.length}</span>
                            </div>

                            <div className={styles.taskList}>
                                {quadrantTasks.map((task) => {
                                    const energyBadge = getEnergyBadge(task.energy);

                                    return (
                                        <div
                                            key={task.id}
                                            className={styles.taskCard}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task)}
                                            onClick={() => onTaskClick?.(task)}
                                        >
                                            <GripVertical size={14} className={styles.dragHandle} />
                                            <span className={styles.taskTitle}>{task.title}</span>
                                            {energyBadge && (
                                                <span className={styles.energyBadge} title={`Năng lượng: ${energyBadge.label}`}>
                                                    {energyBadge.emoji}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                                {quadrantTasks.length === 0 && (
                                    <div className={styles.emptyQuadrant}>
                                        Kéo thả task vào đây
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: '#EF4444' }} />
                    <span>Làm ngay</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: '#3B82F6' }} />
                    <span>Lên lịch</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: '#F59E0B' }} />
                    <span>Làm nhanh</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: '#6B7280' }} />
                    <span>Xóa/Sau</span>
                </div>
            </div>
        </div>
    );
}
