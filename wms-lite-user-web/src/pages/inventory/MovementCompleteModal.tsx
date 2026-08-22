import React, { useState, useEffect } from 'react';
import { CheckCircle, X, AlertCircle, ArrowRightLeft } from 'lucide-react';
import type { MovementSummaryResponse, MovementCompleteRequest } from '../../features/stockmovement';
import styles from '../../styles/CommonModal.module.css';

export interface MovementCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMovement: MovementSummaryResponse | null;
  onSubmit: (id: number, data: MovementCompleteRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export const MovementCompleteModal: React.FC<MovementCompleteModalProps> = ({
  isOpen,
  onClose,
  targetMovement,
  onSubmit,
  isSubmitting = false,
}) => {
  const [movedQuantity, setMovedQuantity] = useState<number>(0);
  const [memo, setMemo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (targetMovement && isOpen) {
      setMovedQuantity(targetMovement.quantity);
      setMemo('');
      setError(null);
    }
  }, [targetMovement, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !targetMovement) return null;

  const requestedQty = targetMovement.quantity;
  const qtyDiff = movedQuantity - requestedQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (movedQuantity <= 0) {
      setError('실제 이동 수량은 1 이상이어야 합니다.');
      return;
    }
    if (movedQuantity > requestedQty) {
      setError(`실제 이동 수량(${movedQuantity})이 요청 수량(${requestedQty})을 초과할 수 없습니다.`);
      return;
    }

    try {
      await onSubmit(targetMovement.id, { movedQuantity, memo: memo.trim() || undefined });
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '이동 확정 처리 중 오류가 발생했습니다.';
      setError(msg);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px' }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <CheckCircle size={20} style={{ color: '#4ade80' }} />
            <span>재고 이동 확정 처리 (Complete)</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 이동 정보 요약 박스 */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.875rem',
            }}
          >
            <div>
              <span style={{ color: '#94a3b8' }}>이동 코드: </span>
              <strong style={{ color: '#60a5fa' }}>{targetMovement.movementCode}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>품목명: </span>
              <span style={{ color: '#f8fafc', fontWeight: 500 }}>{targetMovement.itemName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>이동 경로: </span>
              <span style={{ color: '#93c5fd', fontWeight: 600 }}>{targetMovement.fromLocationCode}</span>
              <ArrowRightLeft size={13} style={{ color: '#64748b' }} />
              <span style={{ color: '#93c5fd', fontWeight: 600 }}>{targetMovement.toLocationCode}</span>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>요청 수량: </span>
              <strong style={{ color: '#f8fafc' }}>{requestedQty.toLocaleString()} EA</strong>
            </div>
          </div>

          {/* 실제 이동 수량 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              실제 이동 수량 <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              min="1"
              max={requestedQty}
              className={styles.input}
              value={movedQuantity || ''}
              onChange={(e) => setMovedQuantity(Number(e.target.value))}
              required
            />
            {/* 수량 차이 피드백 */}
            {movedQuantity > 0 && movedQuantity !== requestedQty && (
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginTop: '0.2rem',
                  color: qtyDiff < 0 ? '#facc15' : '#f87171',
                }}
              >
                {qtyDiff < 0
                  ? `⚠ 요청 대비 ${Math.abs(qtyDiff)} EA 부족 이동 (일부 확정)`
                  : `✖ 요청 수량 초과 — 수정 필요`}
              </div>
            )}
            {movedQuantity === requestedQty && movedQuantity > 0 && (
              <div
                style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.2rem', color: '#4ade80' }}
              >
                ✓ 요청 수량 전량 이동 완료
              </div>
            )}
          </div>

          {/* 확정 메모 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>확정 메모 (선택)</label>
            <textarea
              className={styles.textarea}
              rows={2}
              placeholder="예: 일부 파손으로 부분 이동 확정, 이동 완료 확인 등"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)',
              }}
            >
              {isSubmitting ? '확정 처리 중...' : '이동 확정 처리'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
