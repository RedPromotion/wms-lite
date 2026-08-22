import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { getLocationsApi } from '../../features/master/masterApi';
import type { LocationResponse } from '../../features/master/master';
import styles from '../../styles/CommonModal.module.css';

export interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: LocationResponse | { id: number; locationCode: string; warehouseName?: string; zone?: string; rack?: string; level?: string }) => void;
  title?: string;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = '로케이션 마스터 조회 및 선택',
}) => {
  const [locations, setLocations] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyword('');
      setLoading(true);
      getLocationsApi()
        .then((res: any[]) => {
          setLocations(res || []);
        })
        .catch((err) => {
          console.warn('로케이션 목록 조회 에러:', err);
          setLocations([]);
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

  const filteredLocations = useMemo(() => {
    if (!keyword.trim()) return locations;
    const k = keyword.toLowerCase().trim();
    return locations.filter((loc) => {
      const code = (loc.locationCode || loc.code || '').toLowerCase();
      const wh = (loc.warehouseName || loc.name || '').toLowerCase();
      const zone = (loc.zone || '').toLowerCase();
      const rack = (loc.rack || '').toLowerCase();
      return code.includes(k) || wh.includes(k) || zone.includes(k) || rack.includes(k);
    });
  }, [locations, keyword]);

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
            <MapPin size={20} style={{ color: '#3b82f6' }} />
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
              placeholder="로케이션코드, 창고명, 존(Zone), 랙(Rack) 검색..."
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
                  <th style={{ padding: '0.65rem 0.85rem' }}>로케이션 코드</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>소속 창고명</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>보관 구역 (Zone)</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>랙 (Rack) / 단 (Level)</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>선택</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      로케이션 목록을 불러오는 중입니다...
                    </td>
                  </tr>
                ) : filteredLocations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      검색 조건에 맞는 로케이션이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map((loc) => {
                    const code = loc.locationCode || loc.code || `LOC-${loc.id}`;
                    const whName = loc.warehouseName || loc.name || '메인 창고';
                    return (
                      <tr
                        key={loc.id}
                        style={{
                          borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          onSelect(loc);
                          onClose();
                        }}
                      >
                        <td style={{ padding: '0.65rem 0.85rem', color: '#38bdf8', fontWeight: 600 }}>
                          {code}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#f8fafc', fontWeight: 500 }}>
                          {whName}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>
                          {loc.zone || '보관 구역 A'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#94a3b8' }}>
                          {loc.rack ? `${loc.rack} / ${loc.level || '1단'}` : '1열 1단'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            className={styles.submitBtn}
                            style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', height: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(loc);
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
