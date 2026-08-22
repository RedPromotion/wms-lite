import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Sliders,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, PageToolbar, PageActionBar } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { SearchInput } from '../../components/SearchInput';
import { SearchableSelect, type SelectOption } from '../../components/SearchableSelect';
import { ServerErrorPanel } from '../../components/ServerErrorPanel';
import { StockAdjustModal } from './StockAdjustModal';
import {
  getInventoryListApi,
  adjustInventoryApi,
  type InventorySummaryResponse,
} from '../../features/inventory';
import { getWarehousesApi, type WarehouseResponse } from '../../features/master';
import { ItemSearchModal, LocationSearchModal } from '../../components/master-modal';
import styles from '../../styles/CommonPage.module.css';

export const InventoryListPage: React.FC = () => {
  const [inventories, setInventories] = useState<InventorySummaryResponse[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 이중 검색 상태
  const [serverSearchInput, setServerSearchInput] = useState('');
  const [activeServerKeyword, setActiveServerKeyword] = useState('');
  const [quickFilterKeyword, setQuickFilterKeyword] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [selectedItemIds, setSelectedItemIds] = useState<(string | number)[]>([]);

  // 마스터 모달 상태
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // 재고 조정 모달 상태
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetItem, setAdjustTargetItem] = useState<InventorySummaryResponse | null>(null);
  const [isAdjustSubmitting, setIsAdjustSubmitting] = useState(false);

  const fetchInventories = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setGridLoading(true);
    }
    setError(null);

    try {
      const pageData = await getInventoryListApi({
        keyword: activeServerKeyword || undefined,
        size: 50,
      });

      const mapped: InventorySummaryResponse[] = (pageData.content || []).map((dto: any) => ({
        id: dto.id,
        warehouseName: dto.warehouseName || '메인 창고',
        locationCode: dto.locationCode || 'A-01',
        itemCode: dto.itemCode,
        itemName: dto.itemName,
        quantity: dto.quantity,
        allocatedQuantity: dto.allocatedQuantity,
        availableQuantity: dto.availableQuantity ?? (dto.quantity - dto.allocatedQuantity),
        safetyStockQuantity: dto.safetyStockQuantity ?? undefined,
        updatedAt: dto.updatedAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
      }));

      setInventories(mapped);
    } catch (err: unknown) {
      const errorMessage =
        (err as { message?: string }).message ||
        '백엔드 API 서버(http://localhost:8080)와 통신할 수 없습니다.';
      setError(errorMessage);
    } finally {
      setIsInitialLoading(false);
      setGridLoading(false);
    }
  }, [activeServerKeyword]);

  useEffect(() => {
    fetchInventories(true);
    getWarehousesApi()
      .then((res) => {
        if (res && res.length > 0) setWarehouses(res);
      })
      .catch((err) => console.warn('창고 마스터 로드 실패:', err));
  }, []);

  useEffect(() => {
    fetchInventories(false);
  }, [activeServerKeyword, fetchInventories]);

  const handleServerSearch = () => {
    setActiveServerKeyword(serverSearchInput.trim());
  };

  const handleOpenAdjustModal = (item?: InventorySummaryResponse) => {
    if (item) {
      setAdjustTargetItem(item);
      setIsAdjustModalOpen(true);
      return;
    }

    if (selectedItemIds.length === 0) {
      alert('실사 조정을 진행할 재고 항목을 체크박스에서 먼저 선택해 주세요.');
      return;
    }
    if (selectedItemIds.length > 1) {
      alert('한 번에 1개의 재고 항목만 선택하여 조정할 수 있습니다.');
      return;
    }

    const target = inventories.find((i) => i.id === selectedItemIds[0]);
    if (target) {
      setAdjustTargetItem(target);
      setIsAdjustModalOpen(true);
    }
  };

  const handleAdjustSubmit = async (id: number, newQuantity: number, reason: string) => {
    setIsAdjustSubmitting(true);
    try {
      await adjustInventoryApi(id, { newQuantity, reason });
      toast.success('재고 실사 조정이 백엔드 DB에 성공적으로 반영되었습니다!');
      setIsAdjustModalOpen(false);
      fetchInventories(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '재고 조정 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setIsAdjustSubmitting(false);
    }
  };

  const filteredInventories = inventories.filter((inv) => {
    const matchesQuick =
      !quickFilterKeyword.trim() ||
      inv.itemCode.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      inv.itemName.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      inv.locationCode.toLowerCase().includes(quickFilterKeyword.toLowerCase());

    const matchesWarehouse =
      selectedWarehouse === 'ALL' || inv.warehouseName === selectedWarehouse;

    return matchesQuick && matchesWarehouse;
  });

  // DB 마스터 기반 동적 창고 셀렉트 옵션
  const warehouseOptions: SelectOption[] = [
    { label: '전체 창고 목록', value: 'ALL' },
    ...warehouses.map((wh: any) => {
      const code = wh.warehouseCode || wh.code || `WH-${wh.id}`;
      const name = wh.warehouseName || wh.name || `창고 ${wh.id}`;
      return {
        label: `[${code}] ${name}`,
        value: name,
      };
    }),
  ];

  const columns: Column<InventorySummaryResponse>[] = [
    {
      key: 'itemCode',
      header: '품목 코드',
      render: (inv) => <span style={{ fontWeight: 600, color: '#60a5fa' }}>{inv.itemCode}</span>,
    },
    {
      key: 'itemName',
      header: '품목명',
      render: (inv) => <span style={{ fontWeight: 500 }}>{inv.itemName}</span>,
    },
    {
      key: 'warehouseName',
      header: '보관 창고',
      render: (inv) => <span style={{ color: '#cbd5e1' }}>{inv.warehouseName}</span>,
    },
    {
      key: 'locationCode',
      header: '로케이션 (Loc)',
      render: (inv) => <span className={styles.unitBadge}>{inv.locationCode || '미지정'}</span>,
    },
    {
      key: 'quantity',
      header: '총 실재고 (OnHand)',
      align: 'right',
      render: (inv) => (
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
          {inv.quantity.toLocaleString()} EA
        </span>
      ),
    },
    {
      key: 'allocatedQuantity',
      header: '출고예약 (Allocated)',
      align: 'right',
      render: (inv) => (
        <span style={{ color: inv.allocatedQuantity > 0 ? '#facc15' : '#94a3b8' }}>
          {inv.allocatedQuantity.toLocaleString()} EA
        </span>
      ),
    },
    {
      key: 'availableQuantity',
      header: '출고가용 (Available)',
      align: 'right',
      render: (inv) => {
        const safetyStock = inv.safetyStockQuantity;
        const hasSafetyStock = safetyStock !== undefined && safetyStock !== null && safetyStock > 0;
        const isLowStock = hasSafetyStock && inv.availableQuantity <= safetyStock;

        return (
          <span
            style={{
              fontWeight: 600,
              color: isLowStock ? '#f87171' : '#4ade80',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            title={
              hasSafetyStock
                ? (isLowStock ? `안전재고(${safetyStock}EA) 미달` : `안전재고(${safetyStock}EA) 충족`)
                : '안전재고 미지정 (비관리 품목)'
            }
          >
            {isLowStock && <AlertTriangle size={13} />}
            {inv.availableQuantity.toLocaleString()} EA
            {hasSafetyStock && (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '0.25rem' }}>
                (기준: {safetyStock}EA)
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: 'updatedAt',
      header: '최종 변동 일시',
      render: (inv) => <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{inv.updatedAt}</span>,
    },
    {
      key: 'actions',
      header: '손익 실사',
      align: 'center',
      render: (inv) => (
        <button
          className={styles.iconBtn}
          title="재고 실사/손익 조정"
          onClick={() => handleOpenAdjustModal(inv)}
          style={{ width: 'auto', padding: '0 0.5rem', gap: '0.2rem', fontSize: '0.75rem' }}
        >
          <Sliders size={13} style={{ color: '#60a5fa' }} />
          조정
        </button>
      ),
    },
  ];

  const serverBadgeText = activeServerKeyword
    ? `'${activeServerKeyword}' (${inventories.length}건)`
    : `${inventories.length}건`;
  const quickBadgeText = quickFilterKeyword.trim()
    ? `'${quickFilterKeyword}' (${filteredInventories.length}건)`
    : undefined;

  return (
    <div className={styles.container}>
      <PageHeader
        icon={<Boxes size={22} style={{ color: '#3b82f6' }} />}
        title="실시간 재고 현황 (Inventory Stock)"
        description="물류 센터별/로케이션별 실재고 수량, 출고 예약량 및 가용 재고 현황을 모니터링합니다."
      />

      {error ? (
        <ServerErrorPanel
          message={error}
          onRetry={() => fetchInventories(true)}
        />
      ) : isInitialLoading ? (
        <div className={styles.fullPageLoading}>
          <div className={styles.spinner} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>
            백엔드 API 서버와 연결 및 재고 데이터 조회 중입니다...
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Spring Boot 백엔드 서버(http://localhost:8080)에 접속하고 있습니다.
          </p>
        </div>
      ) : (
        <>
          {/* 1단 라인: 🔍 검색 & 필터 조작 툴바 */}
          <PageToolbar
            left={
              <>
                <SearchInput
                  label="DB 전체 조회 검색"
                  badgeText={serverBadgeText}
                  badgeType="server"
                  value={serverSearchInput}
                  onChange={setServerSearchInput}
                  onSearch={handleServerSearch}
                  placeholder="품목코드 / 품목명 (Enter/조회)"
                />

                <SearchInput
                  label="상세검색 (결과 내 빠른 필터)"
                  badgeText={quickBadgeText}
                  badgeType="quick"
                  value={quickFilterKeyword}
                  onChange={setQuickFilterKeyword}
                  placeholder="결과 내 실시간 필터..."
                />

                <div className={styles.categorySelectWrapper}>
                  <span className={styles.selectLabel}>보관 창고 선택</span>
                  <SearchableSelect
                    options={warehouseOptions}
                    value={selectedWarehouse}
                    onChange={setSelectedWarehouse}
                    placeholder="창고 선택"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '100%', paddingTop: '1.25rem' }}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    style={{ padding: '0.55rem 0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => setIsItemModalOpen(true)}
                  >
                    품목 찾기
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    style={{ padding: '0.55rem 0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => setIsLocationModalOpen(true)}
                  >
                    로케이션 찾기
                  </button>
                </div>
              </>
            }
          />

          {/* 2단 라인: ⚡ 액션 버튼 툴바 (PageActionBar) */}
          <PageActionBar
            left={
              <>
                <button className={styles.createBtn} onClick={() => handleOpenAdjustModal()}>
                  <Sliders size={16} />
                  선택 재고 실사 / 손익 조정
                </button>
                {selectedItemIds.length > 0 && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginLeft: '0.5rem',
                      padding: '0.35rem 0.65rem',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <CheckSquare size={14} />
                    선택된 재고: {selectedItemIds.length}개
                  </div>
                )}
              </>
            }
          />

          <DataGrid<InventorySummaryResponse>
            title="실시간 재고 현황 목록"
            titleIcon={<Boxes size={17} style={{ color: '#3b82f6' }} />}
            columns={columns}
            data={filteredInventories}
            keyExtractor={(inv) => inv.id}
            selectable
            selectedKeys={selectedItemIds}
            onSelectionChange={setSelectedItemIds}
            loading={gridLoading}
            enableExcelExport={true}
            excelFileName="WMS_실시간재고현황_목록"
            pagination={{
              totalElements: filteredInventories.length,
              page: 1,
              size: 10,
            }}
          />
        </>
      )}

      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        inventoryItem={adjustTargetItem}
        onSubmit={handleAdjustSubmit}
        isSubmitting={isAdjustSubmitting}
      />

      <ItemSearchModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSelect={(item: any) => {
          const code = item.itemCode || item.code || item.itemName || item.name || '';
          setQuickFilterKeyword(code);
        }}
      />

      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelect={(loc: any) => {
          const code = loc.locationCode || loc.code || '';
          setQuickFilterKeyword(code);
        }}
      />
    </div>
  );
};
