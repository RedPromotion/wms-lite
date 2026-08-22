import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Package } from 'lucide-react';
import { getItemsApi } from '../../features/master/item/itemApi';
import type { ItemResponse } from '../../features/master/master';
import styles from '../../styles/CommonModal.module.css';

export interface ItemSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: ItemResponse | { id: number; itemCode: string; itemName: string; categoryName?: string; unit?: string; spec?: string }) => void;
  title?: string;
}

export const ItemSearchModal: React.FC<ItemSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = '품목 마스터 조회 및 선택',
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyword('');
      setLoading(true);
      getItemsApi({ page: 0, size: 500 })
        .then((res: any) => {
          const list = res.content || (Array.isArray(res) ? res : []);
          setItems(list);
        })
        .catch((err) => {
          console.warn('품목 목록 조회 에러:', err);
          setItems([]);
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

  const filteredItems = useMemo(() => {
    if (!keyword.trim()) return items;
    const k = keyword.toLowerCase().trim();
    return items.filter((item) => {
      const code = (item.itemCode || item.code || '').toLowerCase();
      const name = (item.itemName || item.name || '').toLowerCase();
      const category = (item.categoryName || '').toLowerCase();
      const spec = (item.spec || '').toLowerCase();
      return code.includes(k) || name.includes(k) || category.includes(k) || spec.includes(k);
    });
  }, [items, keyword]);

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
            <Package size={20} style={{ color: '#10b981' }} />
            <span>{title}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className={styles.form} style={{ gap: '1rem' }}>
          {/* 실시간 검색창 */}
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
              placeholder="품목코드, 품목명, 카테고리, 규격 검색..."
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
                  <th style={{ padding: '0.65rem 0.85rem' }}>품목코드</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>품목명</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>카테고리</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>규격 (Spec)</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>단위</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>선택</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      품목 마스터 목록을 불러오는 중입니다...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      검색 조건에 맞는 품목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const code = item.itemCode || item.code || '';
                    const name = item.itemName || item.name || '';
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          onSelect(item);
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
                          {item.categoryName || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#94a3b8' }}>
                          {item.spec || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>
                          {item.unit || 'EA'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            className={styles.submitBtn}
                            style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', height: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(item);
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
