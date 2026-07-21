'use client';

import { useState } from 'react';
import { useRewards } from '@/lib/hooks/useRewards';
import { Coins, Gift, Plus, X, Check, ShoppingBag, History } from 'lucide-react';
import styles from './RewardStore.module.css';

export default function RewardStore() {
    const {
        coins,
        rewards,
        redeemedHistory,
        redeemReward,
        addCustomReward,
        removeCustomReward,
        EARNING_RATES,
    } = useRewards();

    const [showAddModal, setShowAddModal] = useState(false);
    const [newReward, setNewReward] = useState({ name: '', cost: 100, description: '' });
    const [message, setMessage] = useState(null);

    const handleRedeem = async (rewardId) => {
        const result = await redeemReward(rewardId);
        setMessage(result);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAddReward = async (e) => {
        e.preventDefault();
        if (!newReward.name || newReward.cost <= 0) return;

        await addCustomReward(newReward);
        setNewReward({ name: '', cost: 100, description: '' });
        setShowAddModal(false);
    };

    return (
        <div className={styles.storeContainer}>
            {/* Message Toast */}
            {message && (
                <div className={`${styles.toast} ${message.success ? styles.toastSuccess : styles.toastError}`}>
                    {message.success ? <Check size={16} /> : <X size={16} />}
                    {message.message}
                </div>
            )}

            {/* Coin Balance */}
            <div className={styles.coinBalance}>
                <div className={styles.coinIcon}>
                    <Coins size={24} />
                </div>
                <div className={styles.coinInfo}>
                    <span className={styles.coinAmount}>{coins.toLocaleString()}</span>
                    <span className={styles.coinLabel}>Xu</span>
                </div>
            </div>

            {/* Earning Rates */}
            <div className={styles.earningInfo}>
                <h3 className={styles.sectionTitle}>💰 Cách kiếm xu</h3>
                <div className={styles.ratesGrid}>
                    <div className={styles.rateItem}>
                        <span>Hoàn thành task</span>
                        <span>+{EARNING_RATES.taskComplete} xu</span>
                    </div>
                    <div className={styles.rateItem}>
                        <span>1 Pomodoro</span>
                        <span>+{EARNING_RATES.pomodoroComplete} xu</span>
                    </div>
                    <div className={styles.rateItem}>
                        <span>Check-in hàng ngày</span>
                        <span>+{EARNING_RATES.dailyCheckIn} xu</span>
                    </div>
                    <div className={styles.rateItem}>
                        <span>Streak 7 ngày</span>
                        <span>+{EARNING_RATES.weeklyStreak} xu</span>
                    </div>
                </div>
            </div>

            {/* Rewards List */}
            <div className={styles.rewardsSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>🎁 Phần thưởng</h3>
                    <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
                        <Plus size={16} />
                        Thêm mới
                    </button>
                </div>

                <div className={styles.rewardsGrid}>
                    {rewards.map((reward) => {
                        const canAfford = coins >= reward.cost;

                        return (
                            <div key={reward.id} className={styles.rewardCard}>
                                <div className={styles.rewardHeader}>
                                    <span className={styles.rewardName}>{reward.name}</span>
                                    {reward.isCustom && (
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeCustomReward(reward.id)}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                <p className={styles.rewardDesc}>{reward.description}</p>
                                <div className={styles.rewardFooter}>
                                    <span className={styles.rewardCost}>
                                        🪙 {reward.cost} xu
                                    </span>
                                    <button
                                        className={`${styles.redeemBtn} ${!canAfford ? styles.redeemDisabled : ''}`}
                                        onClick={() => handleRedeem(reward.id)}
                                        disabled={!canAfford}
                                    >
                                        <ShoppingBag size={14} />
                                        {canAfford ? 'Đổi thưởng' : 'Chưa đủ xu'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Redemption History */}
            {redeemedHistory.length > 0 && (
                <div className={styles.historySection}>
                    <h3 className={styles.sectionTitle}>
                        <History size={16} />
                        Lịch sử đổi thưởng
                    </h3>
                    <div className={styles.historyList}>
                        {redeemedHistory.slice(0, 5).map((item, i) => (
                            <div key={i} className={styles.historyItem}>
                                <span>{item.rewardName}</span>
                                <span className={styles.historyDate}>
                                    {new Date(item.redeemedAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Reward Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Thêm phần thưởng</h3>
                            <button onClick={() => setShowAddModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAddReward}>
                            <div className={styles.formGroup}>
                                <label>Tên phần thưởng</label>
                                <input
                                    type="text"
                                    value={newReward.name}
                                    onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                                    placeholder="VD: Đi cafe ☕"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Giá (xu)</label>
                                <input
                                    type="number"
                                    value={newReward.cost}
                                    onChange={(e) => setNewReward({ ...newReward, cost: parseInt(e.target.value) || 0 })}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mô tả</label>
                                <input
                                    type="text"
                                    value={newReward.description}
                                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                                    placeholder="Mô tả ngắn..."
                                />
                            </div>
                            <button type="submit" className={styles.submitBtn}>
                                <Gift size={16} />
                                Thêm phần thưởng
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
