import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../../components/Modal';
import {
  getLocationsByWarehouseApi,
  createLocationApi,
  updateLocationApi,
  deleteLocationApi,
  type LocationResponse,
} from '../../features/master/warehouse';
import styles from '../../styles/CommonPage.module.css';

export interface LocationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: { id: number; code: string; name: string } | null;
}

export const LocationManagementModal: React.FC<LocationManagementModalProps> = ({
  isOpen,
  onClose,
  warehouse,
}) => {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 폼 입력 상태 (추가 / 수정 겸용)
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    xAxis: string;
    yAxis: string;
    zAxis: string;
    description: string;
  }>({
    code: '',
    name: '',
    xAxis: '',
    yAxis: '',
    zAxis: '',
    description: '',
  });

  const fetchLocations = useCallback(async () => {
    if (!warehouse?.id) return;
    setLoading(true);
    try {
      const data = await getLocationsByWarehouseApi(warehouse.id);
      setLocations(data);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '로케이션 목록을 불러올 수 없습니다.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [warehouse?.id]);

  useEffect(() => {
    if (isOpen && warehouse?.id) {
      fetchLocations();
      resetForm();
    }
  }, [isOpen, warehouse?.id, fetchLocations]);

  const resetForm = () => {
    setEditingLocationId(null);
    setFormData({
      code: '',
      name: '',
      xAxis: '',
      yAxis: '',
      zAxis: '',
      description: '',
    });
  };

  const handleSelectEdit = (loc: LocationResponse) => {
    setEditingLocationId(loc.id);
    setFormData({
      code: loc.code,
      name: loc.name,
      xAxis: loc.xAxis != null ? String(loc.xAxis) : '',
      yAxis: loc.yAxis != null ? String(loc.yAxis) : '',
      zAxis: loc.zAxis != null ? String(loc.zAxis) : '',
      description: loc.description || '',
    });
  };

  const handleDelete = async (loc: LocationResponse) => {
    if (!warehouse?.id) return;
    if (!window.confirm(`'${loc.name} (${loc.code})' 로케이션을 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteLocationApi(warehouse.id, loc.id);
      toast.success('로케이션이 삭제되었습니다.');
      if (editingLocationId === loc.id) {
        resetForm();
      }
      fetchLocations();
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '삭제 중 오류가 발생했습니다.';
      toast.error(msg);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouse?.id) return;

    if (!formData.code.trim() || !formData.name.trim()) {
      alert('로케이션 코드와 로케이션명은 필수입니다.');
      return;
    }

    const payload = {
      warehouseId: warehouse.id,
      code: formData.code.trim(),
      name: formData.name.trim(),
      xAxis: formData.xAxis ? parseInt(formData.xAxis, 10) : undefined,
      yAxis: formData.yAxis ? parseInt(formData.yAxis, 10) : undefined,
      zAxis: formData.zAxis ? parseInt(formData.zAxis, 10) : undefined,
      description: formData.description.trim() || undefined,
    };

    try {
      if (editingLocationId) {
        // 수정
        await updateLocationApi(warehouse.id, editingLocationId, {
          name: payload.name,
          xAxis: payload.xAxis,
          yAxis: payload.yAxis,
          zAxis: payload.zAxis,
          description: payload.description,
        });
        toast.success('로케이션 정보가 수정되었습니다.');
      } else {
        // 생성
        await createLocationApi(warehouse.id, payload);
        toast.success('신규 로케이션이 등록되었습니다.');
      }
      resetForm();
      fetchLocations();
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '저장 중 오류가 발생했습니다.';
      toast.error(msg);
    }
  };

  if (!warehouse) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <MapPin size={20} style={{ color: '#3b82f6' }} />
          창고 내 로케이션(위치) 관리
        </>
      }
    >
      <div style={{ padding: '0.25rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* 상단 창고 헤더 뱃지 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(51, 65, 85, 0.8)',
            borderRadius: '8px',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>대상 창고</span>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa' }}>
              {warehouse.name} ({warehouse.code})
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                padding: '0.25rem 0.6rem',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#93c5fd',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              등록된 위치: {locations.length}개
            </span>
            <button
              type="button"
              className={styles.iconBtn}
              title="새로고침"
              onClick={fetchLocations}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? styles.spin : undefined} />
            </button>
          </div>
        </div>

        {/* 로케이션 목록 테이블 */}
        <div
          style={{
            maxHeight: '220px',
            overflowY: 'auto',
            border: '1px solid rgba(51, 65, 85, 0.7)',
            borderRadius: '8px',
            background: '#0f172a',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>코드</th>
                <th style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>위치명</th>
                <th style={{ padding: '0.6rem 0.8rem', fontWeight: 600, textAlign: 'center' }}>좌표(X/Y/Z)</th>
                <th style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>비고</th>
                <th style={{ padding: '0.6rem 0.8rem', fontWeight: 600, textAlign: 'center' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                    로케이션 데이터를 조회하는 중...
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                    등록된 로케이션이 없습니다. 아래 폼에서 신규 위치를 생성하세요.
                  </td>
                </tr>
              ) : (
                locations.map((loc) => {
                  const isSelected = editingLocationId === loc.id;
                  return (
                    <tr
                      key={loc.id}
                      style={{
                        borderTop: '1px solid rgba(51, 65, 85, 0.4)',
                        background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.5rem 0.8rem', fontWeight: 600, color: '#60a5fa' }}>
                        {loc.code}
                      </td>
                      <td style={{ padding: '0.5rem 0.8rem', color: '#f8fafc' }}>{loc.name}</td>
                      <td style={{ padding: '0.5rem 0.8rem', textAlign: 'center', color: '#cbd5e1' }}>
                        {loc.xAxis != null || loc.yAxis != null || loc.zAxis != null
                          ? `${loc.xAxis ?? '-'}/${loc.yAxis ?? '-'}/${loc.zAxis ?? '-'}`
                          : '-'}
                      </td>
                      <td style={{ padding: '0.5rem 0.8rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                        {loc.description || '-'}
                      </td>
                      <td style={{ padding: '0.5rem 0.8rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            title="수정"
                            onClick={() => handleSelectEdit(loc)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                            title="삭제"
                            onClick={() => handleDelete(loc)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 폼 영역: 추가 / 수정 */}
        <form
          onSubmit={handleSubmitForm}
          style={{
            padding: '1rem',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.8)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
              {editingLocationId ? '✏️ 선택된 위치 정보 수정' : '➕ 신규 위치 추가'}
            </span>
            {editingLocationId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                신규 추가로 전환
              </button>
            )}
          </div>

          <Modal.FormRow>
            <Modal.FormGroup>
              <Modal.Label required>위치 코드</Modal.Label>
              <Modal.Input
                required
                disabled={!!editingLocationId}
                placeholder="예: LOC-A-101"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                style={editingLocationId ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
              />
            </Modal.FormGroup>

            <Modal.FormGroup>
              <Modal.Label required>위치명 / 구역명</Modal.Label>
              <Modal.Input
                required
                placeholder="예: A구역 1열 1단"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Modal.FormGroup>
          </Modal.FormRow>

          <Modal.FormRow>
            <Modal.FormGroup>
              <Modal.Label>X축 (통로/행)</Modal.Label>
              <Modal.Input
                type="number"
                placeholder="예: 1"
                value={formData.xAxis}
                onChange={(e) => setFormData({ ...formData, xAxis: e.target.value })}
              />
            </Modal.FormGroup>

            <Modal.FormGroup>
              <Modal.Label>Y축 (열/랙)</Modal.Label>
              <Modal.Input
                type="number"
                placeholder="예: 2"
                value={formData.yAxis}
                onChange={(e) => setFormData({ ...formData, yAxis: e.target.value })}
              />
            </Modal.FormGroup>

            <Modal.FormGroup>
              <Modal.Label>Z축 (높이/단)</Modal.Label>
              <Modal.Input
                type="number"
                placeholder="예: 3"
                value={formData.zAxis}
                onChange={(e) => setFormData({ ...formData, zAxis: e.target.value })}
              />
            </Modal.FormGroup>
          </Modal.FormRow>

          <Modal.FormGroup>
            <Modal.Label>설명 / 비고</Modal.Label>
            <Modal.Input
              placeholder="예: 파렛트 랙 적치 구역"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Modal.FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              type="submit"
              className={Modal.styles.submitBtn}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
              }}
            >
              {editingLocationId ? (
                <>
                  <CheckCircle2 size={15} />
                  수정 완료
                </>
              ) : (
                <>
                  <Plus size={15} />
                  위치 등록
                </>
              )}
            </button>
          </div>
        </form>

        <Modal.Footer>
          <button type="button" className={Modal.styles.cancelBtn} onClick={onClose}>
            닫기
          </button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};
