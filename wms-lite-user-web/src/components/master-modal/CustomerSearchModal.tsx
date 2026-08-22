import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Users } from 'lucide-react';
import { getCustomersApi } from '../../features/master/masterApi';
import type { CustomerResponse } from '../../features/master/master';
import styles from '../../styles/CommonModal.module.css';

export interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: CustomerResponse | { id: number; customerCode: string; customerName: string; businessNo?: string; phone?: string; address?: string }) => void;
  title?: string;
}

export const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = '고객사(출고처) 마스터 조회 및 선택',
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyword('');
      setLoading(true);
      getCustomersApi()
        .then((res: any[]) => {
          setCustomers(res || []);
        })
        .catch((err) => {
          console.warn('고객사 목록 조회 에러:', err);
          setCustomers([]);
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

  const filteredCustomers = useMemo(() => {
    if (!keyword.trim()) return customers;
    const k = keyword.toLowerCase().trim();
    return customers.filter((cust) => {
      const code = (cust.customerCode || cust.code || '').toLowerCase();
      const name = (cust.customerName || cust.name || '').toLowerCase();
      const bizNo = (cust.businessNo || '').toLowerCase();
      const phone = (cust.phone || '').toLowerCase();
      const address = (cust.address || '').toLowerCase();
      return code.includes(k) || name.includes(k) || bizNo.includes(k) || phone.includes(k) || address.includes(k);
    });
  }, [customers, keyword]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '90%' }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Users size={20} style={{ color: '#ec4899' }} />
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
              placeholder="고객사코드, 고객사명, 대표자, 사업자번호, 주소 검색..."
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
                  <th style={{ padding: '0.65rem 0.85rem' }}>고객사 코드</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>고객사명</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>대표자</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>연락처</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>배송지 주소</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>선택</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      고객사 목록을 불러오는 중입니다...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      검색 조건에 맞는 고객사가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const code = cust.customerCode || cust.code || `CUST-${cust.id}`;
                    const name = cust.customerName || cust.name || '';
                    return (
                      <tr
                        key={cust.id}
                        style={{
                          borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          onSelect(cust);
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
                          {cust.ceoName || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#94a3b8' }}>
                          {cust.phone || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>
                          {cust.address || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            className={styles.submitBtn}
                            style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', height: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(cust);
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
