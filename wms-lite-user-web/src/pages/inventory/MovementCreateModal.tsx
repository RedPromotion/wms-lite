import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, X, AlertCircle, Package, MapPin } from 'lucide-react';
import type { MovementCreateRequest } from '../../features/stockmovement';
import { getItemsApi } from '../../features/master/item/itemApi';
import { getLocationsApi } from '../../features/master/masterApi';
import { getInventoryListApi } from '../../features/inventory/inventoryApi';
import type { InventorySummaryResponse } from '../../features/inventory/inventory';
import { SearchableSelect } from '../../components/SearchableSelect';
import styles from '../../styles/CommonModal.module.css';

export interface MovementCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MovementCreateRequest) => Promise<void>;
  isSubmitting?: boolean;
}

const INITIAL_FORM: MovementCreateRequest = {
  fromLocationId: 0,
  toLocationId: 0,
  itemId: 0,
  quantity: 1,
  reason: '',
};

export const MovementCreateModal: React.FC<MovementCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [form, setForm] = useState<MovementCreateRequest>(INITIAL_FORM);
  const [items, setItems] = useState<Array<{ id: number; code: string; name: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: number; code: string; name: string }>>([]);
  const [inventoryList, setInventoryList] = useState<InventorySummaryResponse[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM);
      setError(null);
      setInventoryList([]);

      // 1. 품목 목록 API 실데이터 조회
      getItemsApi({ page: 0, size: 200 })
        .then((res) => {
          if (res.content && res.content.length > 0) {
            setItems(res.content.map((item) => ({ id: item.id, code: item.code, name: item.name })));
          }
        })
        .catch((err) => {
          console.warn('품목 목록 조회 중 오류:', err);
        });

      // 2. 로케이션 목록 API 실데이터 조회
      getLocationsApi()
        .then((locRes: any[]) => {
          if (locRes && locRes.length > 0) {
            setLocations(
              locRes.map((loc) => ({
                id: loc.id,
                code: loc.code || loc.locationCode || `LOC-${loc.id}`,
                name: loc.name || loc.warehouseName || '',
              }))
            );
          }
        })
        .catch((err) => {
          console.warn('로케이션 목록 조회 중 오류:', err);
        });
    }
  }, [isOpen]);

  // 품목 선택 시 해당 품목의 현재 재고 위치 및 수량 자동 조회
  useEffect(() => {
    if (form.itemId > 0) {
      setIsLoadingInventory(true);
      getInventoryListApi({ itemId: form.itemId, size: 100 })
        .then((res) => {
          setInventoryList(res.content || []);
        })
        .catch((err) => {
          console.warn('품목 재고 조회 중 오류:', err);
          setInventoryList([]);
        })
        .finally(() => {
          setIsLoadingInventory(false);
        });
    } else {
      setInventoryList([]);
    }
  }, [form.itemId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (field: keyof MovementCreateRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.itemId <= 0) {
      setError('품목 ID를 입력해 주세요.');
      return;
    }
    if (form.fromLocationId <= 0) {
      setError('출발 로케이션을 선택해 주세요.');
      return;
    }
    if (form.toLocationId <= 0) {
      setError('도착 로케이션을 선택해 주세요.');
      return;
    }
    if (form.fromLocationId === form.toLocationId) {
      setError('출발 로케이션과 도착 로케이션이 동일합니다.');
      return;
    }
    if (form.quantity <= 0) {
      setError('이동 수량은 1 이상이어야 합니다.');
      return;
    }

    try {
      await onSubmit(form);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '이동 요청 등록 중 오류가 발생했습니다.';
      setError(msg);
    }
  };

  const fromLocationCode = locations.find((l) => l.id === form.fromLocationId)?.code;
  const toLocationCode = locations.find((l) => l.id === form.toLocationId)?.code;

  // 현재 선택된 출발 로케이션의 가용 재고 계산
  const selectedFromInventory = inventoryList.find((inv) => inv.locationId === form.fromLocationId);
  const availableQty = selectedFromInventory ? selectedFromInventory.availableQuantity : null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px' }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <ArrowRightLeft size={20} style={{ color: '#3b82f6' }} />
            <span>재고 이동 요청 등록 (Movement Request)</span>
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

          {/* 출발 → 도착 미리보기 배지 */}
          {fromLocationCode && toLocationCode && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0.85rem',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#93c5fd',
              }}
            >
              <span>{fromLocationCode}</span>
              <ArrowRightLeft size={14} />
              <span>{toLocationCode}</span>
              <span style={{ color: '#64748b', fontWeight: 400, marginLeft: 'auto' }}>
                이동 경로 미리보기
              </span>
            </div>
          )}

          {/* 품목 실시간 검색 및 선택 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              이동 대상 품목 <span className={styles.required}>*</span>
            </label>
            <SearchableSelect
              options={items.map((item) => ({
                label: `[${item.code}] ${item.name}`,
                value: String(item.id),
              }))}
              value={form.itemId ? String(form.itemId) : ''}
              onChange={(val) => handleChange('itemId', Number(val))}
              placeholder="품목 코드 또는 품목명 검색"
            />
          </div>

          {/* 선택 품목의 현재 재고 보유 위치 안내 카드 */}
          {form.itemId > 0 && (
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                fontSize: '0.85rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#38bdf8',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                <Package size={16} />
                <span>선택 품목의 현재 재고 보유 위치</span>
                {isLoadingInventory && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>
                    (조회 중...)
                  </span>
                )}
              </div>

              {inventoryList.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  {isLoadingInventory
                    ? '재고 정보를 불러오는 중입니다...'
                    : '⚠️ 현재 해당 품목의 보관 중인 재고가 없습니다.'}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    maxHeight: '130px',
                    overflowY: 'auto',
                  }}
                >
                  {inventoryList.map((inv) => {
                    const isSelected = form.fromLocationId === inv.locationId;
                    return (
                      <div
                        key={inv.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.65rem',
                          background: isSelected
                            ? 'rgba(59, 130, 246, 0.2)'
                            : 'rgba(15, 23, 42, 0.6)',
                          border: isSelected
                            ? '1px solid #3b82f6'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={14} style={{ color: isSelected ? '#60a5fa' : '#94a3b8' }} />
                          <span style={{ color: '#f8fafc', fontWeight: 500 }}>
                            [{inv.locationCode}] {inv.warehouseName}
                          </span>
                          <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
                            (가용: {inv.availableQuantity.toLocaleString()}개)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleChange('fromLocationId', inv.locationId || 0)}
                          style={{
                            padding: '0.25rem 0.55rem',
                            fontSize: '0.75rem',
                            borderRadius: '4px',
                            background: isSelected ? '#2563eb' : 'rgba(59, 130, 246, 0.18)',
                            color: isSelected ? '#ffffff' : '#60a5fa',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          {isSelected ? '선택됨' : '출발 지정'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 출발 / 도착 로케이션 — 2열 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                출발 로케이션 (From) <span className={styles.required}>*</span>
              </label>
              <SearchableSelect
                options={locations.map((loc) => {
                  const inv = inventoryList.find((i) => i.locationId === loc.id);
                  const qtyText = inv ? ` (🟢 가용재고: ${inv.availableQuantity}개)` : '';
                  return {
                    label: `${loc.code}${loc.name ? ` (${loc.name})` : ''}${qtyText}`,
                    value: String(loc.id),
                  };
                })}
                value={form.fromLocationId ? String(form.fromLocationId) : ''}
                onChange={(val) => handleChange('fromLocationId', Number(val))}
                placeholder="출발 로케이션 검색/선택"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                도착 로케이션 (To) <span className={styles.required}>*</span>
              </label>
              <SearchableSelect
                options={locations
                  .filter((l) => l.id !== form.fromLocationId)
                  .map((loc) => ({
                    label: loc.code + (loc.name ? ` (${loc.name})` : ''),
                    value: String(loc.id),
                  }))}
                value={form.toLocationId ? String(form.toLocationId) : ''}
                onChange={(val) => handleChange('toLocationId', Number(val))}
                placeholder="도착 로케이션 검색/선택"
              />
            </div>
          </div>

          {/* 이동 수량 */}
          <div className={styles.formGroup}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <label className={styles.label} style={{ marginBottom: 0 }}>
                이동 수량 <span className={styles.required}>*</span>
              </label>
              {availableQty !== null && (
                <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                  가용 재고: {availableQty.toLocaleString()}개
                </span>
              )}
            </div>
            <input
              type="number"
              min="1"
              max={availableQty !== null ? availableQty : undefined}
              className={styles.input}
              placeholder="이동할 수량을 입력하세요"
              value={form.quantity || ''}
              onChange={(e) => handleChange('quantity', Number(e.target.value))}
              required
            />
            {availableQty !== null && form.quantity > availableQty && (
              <span
                style={{
                  fontSize: '0.78rem',
                  color: '#f87171',
                  marginTop: '0.2rem',
                  display: 'block',
                }}
              >
                ⚠️ 이동 요청 수량이 출발 로케이션의 가용 재고({availableQty}개)보다 많습니다.
              </span>
            )}
          </div>

          {/* 이동 사유 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>이동 사유 (선택)</label>
            <textarea
              className={styles.textarea}
              rows={2}
              placeholder="예: 보관 구역 재배치, 출고 준비 전진 배치, 저온 창고 이전 등"
              value={form.reason || ''}
              onChange={(e) => handleChange('reason', e.target.value)}
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
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? '등록 처리 중...' : '이동 요청 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

