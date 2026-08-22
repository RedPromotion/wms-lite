import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Truck,
  Package,
  MapPin,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { SearchableSelect, type SelectOption } from '../../components/SearchableSelect';
import {
  getSuppliersApi,
  getItemsApi,
  getLocationsApi,
  type SupplierResponse,
  type ItemResponse,
  type LocationResponse,
} from '../../features/master';
import { createInboundApi, type InboundItemRequest } from '../../features/inbound';
import {
  SupplierSearchModal,
  ItemSearchModal,
  LocationSearchModal,
} from '../../components/master-modal';
import styles from '../../styles/CommonPage.module.css';

interface InboundRow {
  id: string; // 임시 고유키
  itemId: number | null;
  locationId: number | null;
  quantity: number;
}

export const InboundCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // 마스터 옵션 데이터
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loadingMaster, setLoadingMaster] = useState<boolean>(true);

  // 모달 오픈 상태
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState<boolean>(false);
  const [activeItemRowId, setActiveItemRowId] = useState<string | null>(null);
  const [activeLocationRowId, setActiveLocationRowId] = useState<string | null>(null);

  // 폼 입력 상태
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');
  const [rows, setRows] = useState<InboundRow[]>([
    { id: 'row-1', itemId: null, locationId: null, quantity: 10 },
  ]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 마스터 정보 조회
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoadingMaster(true);
      try {
        const [supRes, itemRes, locRes] = await Promise.all([
          getSuppliersApi(),
          getItemsApi(),
          getLocationsApi(),
        ]);

        const rawSuppliers = Array.isArray(supRes) ? supRes : (supRes as any)?.content || [];
        const rawItems = Array.isArray(itemRes) ? itemRes : (itemRes as any)?.content || [];
        const rawLocations = Array.isArray(locRes) ? locRes : (locRes as any)?.content || [];

        setSuppliers(rawSuppliers);
        setItems(rawItems);
        setLocations(rawLocations);
      } catch (err: any) {
        console.warn('마스터 데이터 조회 실패:', err);
      } finally {
        setLoadingMaster(false);
      }
    };

    fetchMasterData();
  }, []);

  // 품목 행 추가
  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { id: `row-${Date.now()}-${Math.random()}`, itemId: null, locationId: null, quantity: 1 },
    ]);
  };

  // 품목 행 삭제
  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      toast.error('최소 1개 이상의 입고 품목이 필요합니다.');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // 행 값 변경
  const handleRowChange = (id: string, field: keyof InboundRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value };
        }
        return r;
      })
    );
  };

  // 입고 등록 전송
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplierId) {
      toast.error('공급업체를 선택해 주세요.');
      return;
    }

    // 품목 유효성 검사
    const invalidRow = rows.find((r) => !r.itemId || !r.locationId || !r.quantity || r.quantity < 1);
    if (invalidRow) {
      toast.error('모든 입고 품목의 대상 품목, 로케이션 및 1개 이상의 수량을 올바르게 입력해 주세요.');
      return;
    }

    const payloadItems: InboundItemRequest[] = rows.map((r) => ({
      itemId: r.itemId!,
      locationId: r.locationId!,
      quantity: Number(r.quantity),
    }));

    setSubmitting(true);
    try {
      await createInboundApi({
        supplierId: selectedSupplierId,
        items: payloadItems,
        description: description.trim() || undefined,
      });
      toast.success('신규 입고지시가 성공적으로 등록되었습니다. (상태: 입고대기)');
      navigate('/inbound/list');
    } catch (err: any) {
      const msg = err?.message || '입고지시 등록 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Select Options 변환
  const supplierOptions: SelectOption[] = [
    { label: '-- 공급업체 선택 --', value: '' },
    ...suppliers.map((s: any) => ({
      label: `[${s.supplierCode || s.code || `SUP-${s.id}`}] ${s.supplierName || s.name || ''}`,
      value: String(s.id),
    })),
  ];

  const itemOptions: SelectOption[] = [
    { label: '-- 품목 선택 --', value: '' },
    ...items.map((i: any) => ({
      label: `[${i.itemCode || i.code || `ITM-${i.id}`}] ${i.itemName || i.name || ''} (${i.categoryName || '기본'})`,
      value: String(i.id),
    })),
  ];

  const locationOptions: SelectOption[] = [
    { label: '-- 적치 로케이션 선택 --', value: '' },
    ...locations.map((l: any) => ({
      label: `[${l.locationCode || l.code || `LOC-${l.id}`}] (${l.warehouseName || l.name || '창고'})`,
      value: String(l.id),
    })),
  ];

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  return (
    <div className={styles.container}>
      <PageHeader
        title="신규 입고 등록"
        description="공급업체로부터 입고될 품목, 수량 및 적치 대상 로케이션 정보를 입력하여 입고지시를 생성합니다."
        icon={<Truck size={24} />}
        extra={
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/inbound/list')}
          >
            <ArrowLeft size={16} />
            목록으로 돌아가기
          </button>
        }
      />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 기본 정보 설정 카드 */}
        <div className={styles.filterSection} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={18} style={{ color: '#3b82f6' }} />
            입고 기본정보
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>
                공급업체 (Supplier) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <SearchableSelect
                    options={supplierOptions}
                    value={selectedSupplierId ? String(selectedSupplierId) : ''}
                    onChange={(val) => setSelectedSupplierId(val ? Number(val) : null)}
                    placeholder="공급업체를 선택하세요"
                  />
                </div>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  style={{ padding: '0 0.85rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={() => setIsSupplierModalOpen(true)}
                >
                  <Search size={14} />
                  찾기
                </button>
              </div>

              {/* 선택 공급업체 정보 팁 */}
              {selectedSupplier && (
                <div
                  style={{
                    marginTop: '0.45rem',
                    fontSize: '0.8rem',
                    color: '#f59e0b',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>🏢 <strong>{(selectedSupplier as any).supplierName || (selectedSupplier as any).name}</strong></span>
                  <span>| {selectedSupplier.businessNo ? `사업자번호: ${selectedSupplier.businessNo}` : '사업자 미등록'}</span>
                  <span>| 📞 {selectedSupplier.phone || '연락처 미등록'}</span>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>
                비고 및 입고 메모
              </label>
              <input
                type="text"
                className={styles.searchInput}
                style={{ width: '100%' }}
                placeholder="예: 정기 입고건, 긴급 발주분 등"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 입고 품목 상세 테이블 */}
        <div className={styles.filterSection} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} style={{ color: '#10b981' }} />
              입고 품목 및 지정 로케이션 목록
            </h3>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleAddRow}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
            >
              <Plus size={15} />
              품목 행 추가
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(30, 41, 59, 0.7)', borderBottom: '1px solid #334155', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', width: '50px' }}>NO</th>
                  <th style={{ padding: '0.75rem 1rem', minWidth: '280px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Package size={14} /> 입고 품목 *
                    </span>
                  </th>
                  <th style={{ padding: '0.75rem 1rem', minWidth: '280px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> 적치 로케이션 *
                    </span>
                  </th>
                  <th style={{ padding: '0.75rem 1rem', width: '140px' }}>입고 수량 *</th>
                  <th style={{ padding: '0.75rem 1rem', width: '70px', textAlign: 'center' }}>삭제</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const selItem = items.find((i) => i.id === row.itemId);
                  const selLoc = locations.find((l) => l.id === row.locationId);

                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 600 }}>
                        {index + 1}
                      </td>

                      {/* 품목 선택 */}
                      <td style={{ padding: '0.5rem 1rem', position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <div style={{ flex: 1, position: 'relative' }}>
                            <SearchableSelect
                              options={itemOptions}
                              value={row.itemId ? String(row.itemId) : ''}
                              onChange={(val) => handleRowChange(row.id, 'itemId', val ? Number(val) : null)}
                              placeholder="품목 검색 및 선택"
                            />
                          </div>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            style={{ padding: '0.45rem 0.75rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            title="품목 마스터 팝업 검색"
                            onClick={() => setActiveItemRowId(row.id)}
                          >
                            <Search size={14} />
                            찾기
                          </button>
                        </div>
                        {selItem && (
                          <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: '#38bdf8' }}>
                            📦 {selItem.categoryName || '기본'} | {selItem.spec ? `규격: ${selItem.spec}` : '규격 미지정'} | 단위: {selItem.unit || 'EA'}
                          </div>
                        )}
                      </td>

                      {/* 로케이션 선택 */}
                      <td style={{ padding: '0.5rem 1rem', position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <div style={{ flex: 1, position: 'relative' }}>
                            <SearchableSelect
                              options={locationOptions}
                              value={row.locationId ? String(row.locationId) : ''}
                              onChange={(val) => handleRowChange(row.id, 'locationId', val ? Number(val) : null)}
                              placeholder="로케이션 검색 및 선택"
                            />
                          </div>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            style={{ padding: '0.45rem 0.75rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            title="로케이션 마스터 팝업 검색"
                            onClick={() => setActiveLocationRowId(row.id)}
                          >
                            <Search size={14} />
                            찾기
                          </button>
                        </div>
                        {selLoc && (
                          <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: '#34d399' }}>
                            📍 {selLoc.warehouseName || '창고'} | {selLoc.zone ? `구역: ${selLoc.zone}` : '일반구역'}
                          </div>
                        )}
                      </td>

                      {/* 수량 */}
                      <td style={{ padding: '0.5rem 1rem' }}>
                        <input
                          type="number"
                          min="1"
                          className={styles.searchInput}
                          style={{ width: '100%', textAlign: 'right' }}
                          value={row.quantity}
                          onChange={(e) => handleRowChange(row.id, 'quantity', Math.max(1, Number(e.target.value)))}
                        />
                      </td>

                      {/* 삭제 버튼 */}
                      <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          title="품목 삭제"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.4rem',
                            borderRadius: '4px',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/inbound/list')}
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={submitting || loadingMaster}
            style={{ minWidth: '140px', justifyContent: 'center' }}
          >
            <Save size={16} />
            {submitting ? '등록 중...' : '입고 지시 등록'}
          </button>
        </div>
      </form>

      {/* 마스터 검색 모달 3종 */}
      <SupplierSearchModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSelect={(sup: any) => {
          setSuppliers((prev) => (prev.some((s) => s.id === sup.id) ? prev : [...prev, sup]));
          setSelectedSupplierId(sup.id);
          setIsSupplierModalOpen(false);
        }}
      />

      <ItemSearchModal
        isOpen={activeItemRowId !== null}
        onClose={() => setActiveItemRowId(null)}
        onSelect={(item: any) => {
          if (activeItemRowId) {
            setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
            handleRowChange(activeItemRowId, 'itemId', item.id);
          }
          setActiveItemRowId(null);
        }}
      />

      <LocationSearchModal
        isOpen={activeLocationRowId !== null}
        onClose={() => setActiveLocationRowId(null)}
        onSelect={(loc: any) => {
          if (activeLocationRowId) {
            setLocations((prev) => (prev.some((l) => l.id === loc.id) ? prev : [...prev, loc]));
            handleRowChange(activeLocationRowId, 'locationId', loc.id);
          }
          setActiveLocationRowId(null);
        }}
      />
    </div>
  );
};

