import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Truck } from 'lucide-react';
import { getSuppliersApi } from '../../features/master/masterApi';
import type { SupplierResponse } from '../../features/master/master';
import styles from '../../styles/CommonModal.module.css';

export interface SupplierSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (supplier: SupplierResponse | { id: number; supplierCode: string; supplierName: string; businessNo?: string; phone?: string }) => void;
  title?: string;
}

export const SupplierSearchModal: React.FC<SupplierSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = '공급업체(입고처) 마스터 조회 및 선택',
}) => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyword('');
      setLoading(true);
      getSuppliersApi()
        .then((res: any[]) => {
          setSuppliers(res || []);
        })
        .catch((err) => {
          console.warn('공급업체 목록 조회 에러:', err);
          setSuppliers([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredSuppliers = useMemo(() => {
    if (!keyword.trim()) return suppliers;
    const k = keyword.toLowerCase().trim();
    return suppliers.filter((sup) => {
      const code = (sup.supplierCode || sup.code || '').toLowerCase();
      const name = (sup.supplierName || sup.name || '').toLowerCase();
      const bizNo = (sup.businessNo || '').toLowerCase();
      const phone = (sup.phone || '').toLowerCase();
      return code.includes(k) || name.includes(k) || bizNo.includes(k) || phone.includes(k);
    });
  }, [suppliers, keyword]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', width: '90%' }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Truck size={20} style={{ color: '#f59e0b' }} />
            <span>{title}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className={styles.form} style={{ gap: '1rem' }}>
          {/* 검색창 */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }}
            />
            <input
              type="text"
              className={styles.input}
              style={{ paddingLeft: '2.5rem' }}
              placeholder="업체코드, 공급업체명, 사업자번호, 전화번호 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
            />
          </div>

          {/* 테이블 목록 */}
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '6px',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr
                  style={{
                    background: 'rgba(30, 41, 59, 0.9)',
                    color: '#94a3b8',
                    textAlign: 'left',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <th style={{ padding: '0.65rem 0.85rem' }}>업체 코드</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>공급업체명</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>사업자 등록번호</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>연락처</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>선택</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      공급업체 목록을 불러오는 중입니다...
                    </td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      검색 조건에 맞는 공급업체가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((sup) => {
                    const code = sup.supplierCode || sup.code || `SUP-${sup.id}`;
                    const name = sup.supplierName || sup.name || '';
                    return (
                      <tr
                        key={sup.id}
                        style={{
                          borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          onSelect(sup);
                          onClose();
                        }}
                      >
                        <td style={{ padding: '0.65rem 0.85rem', color: '#38bdf8', fontWeight: 600 }}>
                          {code}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#f8fafc', fontWeight: 500 }}>
                          {name}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>
                          {sup.businessNo || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#94a3b8' }}>
                          {sup.phone || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            className={styles.submitBtn}
                            style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', height: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(sup);
                              onClose();
                            }}
                          >
                            선택
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
