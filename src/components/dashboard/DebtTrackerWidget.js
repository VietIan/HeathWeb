import { useDebtTracker } from '@/lib/hooks/useDebtTracker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './widgets.module.css';

export default function DebtTrackerWidget() {
    const { debtData, loading, toggleInstallment } = useDebtTracker();

    if (loading) {
        return (
            <div className={styles.widget}>
                <div className={styles.widgetHeader}>
                    <h3 className={styles.widgetTitle}>Thu nợ & Trả góp</h3>
                </div>
                <div style={{ textAlign: 'center', opacity: 0.5 }}>Đang tải...</div>
            </div>
        );
    }

    const { installments } = debtData;
    const paidCount = installments.filter(i => i.isPaid).length;
    const totalCount = installments.length;
    const progressPercent = Math.round((paidCount / totalCount) * 100);

    return (
        <div className={styles.widget}>
            <div className={styles.widgetHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={styles.widgetIcon} style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#EAB308' }}>
                        <FontAwesomeIcon icon="money-bill-wave" />
                    </div>
                    <div>
                        <div className={styles.widgetTitle}>Thu họ / Trả góp</div>
                        <div className={styles.widgetSubtext}>
                            Đã đóng {paidCount}/{totalCount} kỳ
                        </div>
                    </div>
                </div>
                <div className={styles.progressText} style={{ color: '#EAB308' }}>
                    {progressPercent}%
                </div>
            </div>

            <div className={styles.debtGrid}>
                {installments.map((item) => (
                    <div
                        key={item.id}
                        className={`${styles.debtItem} ${item.isPaid ? styles.debtItemPaid : ''}`}
                        onClick={() => toggleInstallment(item.id)}
                    >
                        <span className={styles.debtLabel}>Kỳ {item.id}</span>
                        <div className={styles.debtCheckbox}>
                            {item.isPaid && <FontAwesomeIcon icon="check" />}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.progressBar} style={{ marginTop: '16px' }}>
                <div
                    className={styles.progressFill}
                    style={{
                        width: `${progressPercent}%`,
                        background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)'
                    }}
                />
            </div>
        </div>
    );
}
