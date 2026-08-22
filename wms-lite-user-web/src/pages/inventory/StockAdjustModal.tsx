import React, { useState, useEffect } from 'react';
import { Sliders, X, AlertCircle } from 'lucide-react';
import type { InventorySummaryResponse } from '../../features/inventory';
import styles from '../../styles/CommonModal.module.css';

export interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: InventorySummaryResponse | null;
  onSubmit: (id: number, newQuantity: number, reason: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  inventoryItem,
  onSubmit,
  isSubmitting = false,
}) => {
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (inventoryItem) {
      setNewQuantity(inventoryItem.quantity);
      setReason('');
      setError(null);
    }
  }, [inventoryItem, isOpen]);

  if (!isOpen || !inventoryItem) return null;

  const currentQty = inventoryItem.quantity;
  const diffQty = newQuantity - currentQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newQuantity < 0) {
      setError('조정 후 실재고 수량은 0개 이상이어야 합니다.');
      return;
    }

    if (!reason.trim()) {
      setError('재고 실사/조정 사유를 반드시 입력해 주세요 (예: 정기 재고 조사 파손, 파손/분실, 오입고 수정 등).');
      return;
    }

    try {
      await onSubmit(inventoryItem.id, newQuantity, reason.trim());
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '재고 조정 처리 중 오류가 발생했습니다.';
      setError(msg);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Sliders size={20} style={{ color: '#3b82f6' }} />
            <span>재고 실사 / 손익 조정 (Inventory Adjustment)</span>
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

          {/* 대상 품목 & 창고 정보 요약 박스 */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.875rem',
            }}
          >
            <div>
              <span style={{ color: '#94a3b8' }}>대상 품목: </span>
              <strong style={{ color: '#60a5fa' }}>{inventoryItem.itemName} ({inventoryItem.itemCode})</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>보관 위치: </span>
              <span style={{ color: '#cbd5e1' }}>{inventoryItem.warehouseName} / {inventoryItem.locationCode || '미지정'}</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.2rem' }}>
              <span>현재 실재고: <strong style={{ color: '#f8fafc' }}>{currentQty} EA</strong></span>
              <span>할당 예약: <span style={{ color: '#facc15' }}>{inventoryItem.allocatedQuantity} EA</span></span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              조정 후 실재고 수량 (New OnHand Quantity) <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(Number(e.target.value))}
              className={styles.input}
              placeholder="실사 확인된 수량을 입력하세요"
              required
            />
            {diffQty !== 0 && (
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginTop: '0.2rem',
                  color: diffQty > 0 ? '#4ade80' : '#f87171',
                }}
              >
                변동 수량: {diffQty > 0 ? `+${diffQty}` : diffQty} EA ({diffQty > 0 ? '재고 증가' : '재고 손실/차감'})
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              조정 사유 (Adjustment Reason) <span className={styles.required}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={styles.textarea}
              placeholder="예: 정기 재고 조사 파손분 차감, 오입고 수정, 반품 자재 입고 등"
              rows={3}
              required
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              취소
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? '조정 처리 중...' : '실재고 조정 확정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
