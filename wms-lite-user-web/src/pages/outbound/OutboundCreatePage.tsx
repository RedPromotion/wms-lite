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
  Building,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { SearchableSelect, type SelectOption } from '../../components/SearchableSelect';
import {
  getCustomersApi,
  getItemsApi,
  getLocationsApi,
  getDeliveryAddressesApi,
  type CustomerResponse,
  type ItemResponse,
  type LocationResponse,
} from '../../features/master';
import { createOutboundApi, type OutboundItemRequest } from '../../features/outbound';
import { getInventoryListApi } from '../../features/inventory';
import {
  CustomerSearchModal,
  ItemSearchModal,
  LocationSearchModal,
} from '../../components/master-modal';
import styles from '../../styles/CommonPage.module.css';

interface OutboundRow {
  id: string; // 고유 키
  itemId: number | null;
  locationId: number | null;
  quantity: number;
}

export const OutboundCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // 마스터 옵션
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loadingMaster, setLoadingMaster] = useState<boolean>(true);
  const [stockMap, setStockMap] = useState<Record<string, { availableQuantity: number; quantity: number }>>({});

  // 배송지 상태
  const [deliveryAddresses, setDeliveryAddresses] = useState<any[]>([]);
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);

  // 모달 오픈 상태
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [activeItemRowId, setActiveItemRowId] = useState<string | null>(null);
  const [activeLocationRowId, setActiveLocationRowId] = useState<string | null>(null);

  // 폼 입력 상태
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');
  const [rows, setRows] = useState<OutboundRow[]>([
    { id: 'row-1', itemId: null, locationId: null, quantity: 5 },
  ]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 고객사 변경 시 배송지 목록 자동 조회
  useEffect(() => {
    if (!selectedCustomerId) {
      setDeliveryAddresses([]);
      setSelectedDeliveryAddressId(null);
      return;
    }

    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const addrList = await getDeliveryAddressesApi(selectedCustomerId);
        setDeliveryAddresses(addrList);
        // 기본 배송지 또는 첫번째 항목 자동 선택
        const defaultAddr = addrList.find((a: any) => a.defaultAddress) || addrList[0];
        if (defaultAddr) {
          setSelectedDeliveryAddressId(defaultAddr.id);
        } else {
          setSelectedDeliveryAddressId(null);
        }
      } catch (err) {
        console.warn('배송지 로드 실패:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [selectedCustomerId]);

  // 마스터 데이터 & 실시간 재고 로드
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoadingMaster(true);
      try {
        const [custRes, itemRes, locRes, invRes] = await Promise.all([
          getCustomersApi(),
          getItemsApi(),
          getLocationsApi(),
          getInventoryListApi({ size: 500 }).catch(() => ({ content: [] })),
        ]);

        const rawCustomers = Array.isArray(custRes) ? custRes : (custRes as any)?.content || [];
        const rawItems = Array.isArray(itemRes) ? itemRes : (itemRes as any)?.content || [];
        const rawLocations = Array.isArray(locRes) ? locRes : (locRes as any)?.content || [];
        const invList = (invRes as any)?.content || [];

        const newStockMap: Record<string, { availableQuantity: number; quantity: number }> = {};
        invList.forEach((inv: any) => {
          if (inv.itemCode && inv.locationCode) {
            newStockMap[`${inv.itemCode}_${inv.locationCode}`] = {
              availableQuantity: inv.availableQuantity ?? (inv.quantity - (inv.allocatedQuantity || 0)),
              quantity: inv.quantity,
            };
          }
        });

        setCustomers(rawCustomers);
        setItems(rawItems);
        setLocations(rawLocations);
        setStockMap(newStockMap);
      } catch (err: any) {
        console.warn('마스터 데이터 및 재고 로드 실패:', err);
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
      toast.error('최소 1개 이상의 출고 품목이 필요합니다.');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // 행 필드 수정
  const handleRowChange = (id: string, field: keyof OutboundRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value };
        }
        return r;
      })
    );
  };

  // 등록 전송
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      toast.error('고객사를 선택해 주세요.');
      return;
    }

    if (!selectedDeliveryAddressId) {
      toast.error('선택하신 고객사의 출고 배송지를 선택해 주세요. 등록된 배송지가 없다면 먼저 고객사에 배송지를 등록해 주세요.');
      return;
    }

    const invalidRow = rows.find((r) => !r.itemId || !r.locationId || !r.quantity || r.quantity < 1);
    if (invalidRow) {
      toast.error('모든 출고 품목의 대상 품목, 피킹 지정 로케이션 및 1개 이상의 수량을 입력해 주세요.');
      return;
    }

    const payloadItems: OutboundItemRequest[] = rows.map((r) => ({
      itemId: r.itemId!,
      locationId: r.locationId!,
      quantity: Number(r.quantity),
    }));

    setSubmitting(true);
    try {
      await createOutboundApi({
        customerId: selectedCustomerId,
        deliveryAddressId: selectedDeliveryAddressId,
        items: payloadItems,
        description: description.trim() || undefined,
      });
      toast.success('신규 출고지시가 성공적으로 등록되었습니다. (상태: 출고요청)');
      navigate('/outbound/list');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        '출고지시 등록 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Select 옵션 변환
  const customerOptions: SelectOption[] = [
    { label: '-- 출고 대상 고객사 선택 --', value: '' },
    ...customers.map((c: any) => ({
      label: `[${c.customerCode || c.code || `CUST-${c.id}`}] ${c.customerName || c.name || ''}`,
      value: String(c.id),
    })),
  ];

  const itemOptions: SelectOption[] = [
    { label: '-- 출고 품목 선택 --', value: '' },
    ...items.map((i: any) => ({
      label: `[${i.itemCode || i.code || `ITM-${i.id}`}] ${i.itemName || i.name || ''} (${i.categoryName || '기본'})`,
      value: String(i.id),
    })),
  ];

  const locationOptions: SelectOption[] = [
    { label: '-- 피킹 지정 로케이션 선택 --', value: '' },
    ...locations.map((l: any) => ({
      label: `[${l.locationCode || l.code || `LOC-${l.id}`}] (${l.warehouseName || l.name || '창고'})`,
      value: String(l.id),
    })),
  ];

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className={styles.container}>
      <PageHeader
        title="신규 출고 등록 (Outbound Order)"
        description="출고 대상 고객사와 피킹할 품목, 로케이션 및 요청 수량을 등록하여 출고지시를 생성합니다."
        icon={<Truck size={24} />}
        extra={
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/outbound/list')}
          >
            <ArrowLeft size={16} />
            목록으로 돌아가기
          </button>
        }
      />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 기본 정보 카드 */}
        <div className={styles.filterSection} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} style={{ color: '#3b82f6' }} />
            출고 기본정보
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>
                출고 대상 고객사 (Customer) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <SearchableSelect
                    options={customerOptions}
                    value={selectedCustomerId ? String(selectedCustomerId) : ''}
                    onChange={(val) => setSelectedCustomerId(val ? Number(val) : null)}
                    placeholder="고객사를 선택하세요"
                  />
                </div>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  style={{ padding: '0 0.85rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={() => setIsCustomerModalOpen(true)}
                >
                  <Search size={14} />
                  찾기
                </button>
              </div>

              {/* 선택 고객사 정보 팁 */}
              {selectedCustomer && (
                <div
                  style={{
                    marginTop: '0.45rem',
                    fontSize: '0.8rem',
                    color: '#ec4899',
                    background: 'rgba(236, 72, 153, 0.1)',
                    border: '1px solid rgba(236, 72, 153, 0.25)',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>🏬 <strong>{(selectedCustomer as any).customerName || (selectedCustomer as any).name}</strong></span>
                  <span>| 대표: {selectedCustomer.ceoName || '미등록'}</span>
                  <span>| 📞 {selectedCustomer.phone || '연락처 없음'}</span>
                </div>
              )}
            </div>

            {/* 배송지 선택 */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>
                출고 배송지 주소 (Delivery Address) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {loadingAddresses ? (
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '0.5rem 0' }}>
                  배송지 목록 조회 중...
                </div>
              ) : deliveryAddresses.length > 0 ? (
                <SearchableSelect
                  options={[
                    { label: '-- 배송지 선택 --', value: '' },
                    ...deliveryAddresses.map((a: any) => ({
                      label: `[${a.name || '배송지'}] ${a.receiverName ? `수령인: ${a.receiverName}` : ''} ${a.defaultAddress ? '(기본배송지)' : ''}`,
                      value: String(a.id),
                    })),
                  ]}
                  value={selectedDeliveryAddressId ? String(selectedDeliveryAddressId) : ''}
                  onChange={(val) => setSelectedDeliveryAddressId(val ? Number(val) : null)}
                  placeholder="배송지 주소를 선택하세요"
                />
              ) : selectedCustomerId ? (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#f87171',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                  }}
                >
                  ⚠️ 선택하신 고객사에 등록된 배송지가 없습니다! (시스템의 고객사 관리에서 배송지를 먼저 등록해 주세요)
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#64748b', padding: '0.5rem 0' }}>
                  고객사를 먼저 선택하시면 배송지 목록이 자동 로드됩니다.
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>
                출고 메모 / 배송 비고
              </label>
              <input
                type="text"
                className={styles.searchInput}
                style={{ width: '100%' }}
                placeholder="예: 익일 로켓배송, 긴급 출고 요청 등"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 출고 및 피킹 대상 품목 테이블 */}
        <div className={styles.filterSection} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} style={{ color: '#38bdf8' }} />
              출고 품목 및 피킹 대상 로케이션 목록
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
                      <Package size={14} /> 출고 품목 *
                    </span>
                  </th>
                  <th style={{ padding: '0.75rem 1rem', minWidth: '280px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> 피킹 로케이션 *
                    </span>
                  </th>
                  <th style={{ padding: '0.75rem 1rem', width: '140px' }}>요청 수량 *</th>
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

                      {/* 피킹 로케이션 선택 */}
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
                        {selItem && selLoc && (() => {
                          const itemCode = (selItem as any).itemCode || (selItem as any).code || '';
                          const locCode = (selLoc as any).locationCode || (selLoc as any).code || '';
                          const stockKey = `${itemCode}_${locCode}`;
                          const stockInfo = stockMap[stockKey];
                          const hasStock = stockInfo && stockInfo.availableQuantity > 0;
                          return (
                            <div
                              style={{
                                marginTop: '0.35rem',
                                fontSize: '0.78rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                background: hasStock ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                border: `1px solid ${hasStock ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                color: hasStock ? '#4ade80' : '#f87171',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontWeight: 500,
                              }}
                            >
                              {stockInfo ? (
                                hasStock ? (
                                  <>📦 선택 로케이션 가용재고: <strong>{stockInfo.availableQuantity.toLocaleString()} EA</strong> (총 {stockInfo.quantity.toLocaleString()} EA)</>
                                ) : (
                                  <>⚠️ 선택한 로케이션에 가용 재고가 0개입니다! (출고불가)</>
                                )
                              ) : (
                                <>⚠️ 해당 로케이션에 품목 재고가 존재하지 않습니다 (0 EA)</>
                              )}
                            </div>
                          );
                        })()}
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

                      {/* 삭제 */}
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
            onClick={() => navigate('/outbound/list')}
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
            {submitting ? '등록 중...' : '출고 지시 등록'}
          </button>
        </div>
      </form>

      {/* 마스터 검색 모달 3종 */}
      <CustomerSearchModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelect={(cust: any) => {
          setCustomers((prev) => (prev.some((c) => c.id === cust.id) ? prev : [...prev, cust]));
          setSelectedCustomerId(cust.id);
          setIsCustomerModalOpen(false);
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

