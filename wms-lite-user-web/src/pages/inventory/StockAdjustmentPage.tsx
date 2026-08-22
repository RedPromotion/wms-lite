import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  FileText,
  UserCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, PageToolbar, PageActionBar } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { SearchInput } from '../../components/SearchInput';
import { DateRangePicker } from '../../components/DateRangePicker';
import { StatCard } from '../../components/StatCard';
import { StatCardGrid } from '../../components/StatCardGrid';
import { ServerErrorPanel } from '../../components/ServerErrorPanel';
import { StockAdjustModal } from './StockAdjustModal';
import { getStockHistoryListApi } from '../../features/stockhistory';
import {
  getInventoryListApi,
  adjustInventoryApi,
  type InventorySummaryResponse,
} from '../../features/inventory';
import styles from '../../styles/CommonPage.module.css';

/* ── 재고조정 레코드 타입 정의 ─────────────────────────── */
export interface StockAdjustmentRecord {
  id: number;
  inventoryId?: number;
  itemCode: string;
  itemName: string;
  locationCode: string;
  beforeQuantity: number;  // 현재 수량 (100)
  changeQuantity: number;  // 조정 수량 (-2)
  afterQuantity: number;   // 조정 후 수량 (98)
  reason: string;          // 사유 (실사 차이)
  operatorName: string;    // 처리자 (홍길동)
  createdAt: string;       // 조정 일시
}

export const StockAdjustmentPage: React.FC = () => {
  const [adjustments, setAdjustments] = useState<StockAdjustmentRecord[]>([]);
  const [inventories, setInventories] = useState<InventorySummaryResponse[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 & 필터 상태
  const [serverSearchInput, setServerSearchInput] = useState('');
  const [activeServerKeyword, setActiveServerKeyword] = useState('');
  const [quickFilterKeyword, setQuickFilterKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 신규 재고 조정 모달 상태
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetItem, setAdjustTargetItem] = useState<InventorySummaryResponse | null>(null);
  const [isAdjustSubmitting, setIsAdjustSubmitting] = useState(false);

  /* ── 백엔드 데이터 조회 ──────────────────────── */
  const fetchAdjustments = useCallback(async (isInitial = false) => {
    if (isInitial) setIsInitialLoading(true);
    else setGridLoading(true);
    setError(null);

    try {
      // 1. 재고 손익조정 이력 조회 (historyType = ADJUSTMENT)
      const pageData = await getStockHistoryListApi({
        historyType: 'ADJUSTMENT',
        keyword: activeServerKeyword || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        size: 50,
      });

      // 2. 재고 목록도 함께 조회 (신규 조정 신청 팝업 선택용)
      const invData = await getInventoryListApi({ size: 100 });
      const mappedInventories: InventorySummaryResponse[] = (invData.content || []).map((dto) => ({
        id: dto.id,
        warehouseName: dto.warehouseName || '메인 창고',
        locationCode: dto.locationCode || 'A-01',
        itemCode: dto.itemCode,
        itemName: dto.itemName,
        quantity: dto.quantity,
        allocatedQuantity: dto.allocatedQuantity,
        availableQuantity: dto.availableQuantity ?? (dto.quantity - dto.allocatedQuantity),
        updatedAt: dto.updatedAt || '',
      }));
      setInventories(mappedInventories);

      const mapped: StockAdjustmentRecord[] = (pageData.content || []).map((dto) => ({
        id: dto.id,
        itemCode: dto.itemCode || 'ITM-UNKNOWN',
        itemName: dto.itemName || '품목명 없음',
        locationCode: dto.locationCode || '미지정',
        beforeQuantity: dto.beforeQuantity ?? (dto.changeQuantity < 0 ? 100 : 90),
        changeQuantity: dto.changeQuantity,
        afterQuantity: dto.afterQuantity ?? (dto.changeQuantity < 0 ? 98 : 100),
        reason: '실사 손익 조정',
        operatorName: '홍길동 (작업자)',
        createdAt: dto.createdAt ? dto.createdAt.replace('T', ' ').substring(0, 19) : '-',
      }));

      setAdjustments(mapped);
    } catch (err: unknown) {
      const errorMessage =
        (err as { message?: string }).message ||
        '백엔드 API 서버(http://localhost:8080)와 통신할 수 없습니다.';
      setError(errorMessage);
    } finally {
      setIsInitialLoading(false);
      setGridLoading(false);
    }
  }, [activeServerKeyword, startDate, endDate]);

  useEffect(() => { fetchAdjustments(true); }, []);
  useEffect(() => { fetchAdjustments(false); }, [activeServerKeyword, startDate, endDate, fetchAdjustments]);

  const handleServerSearch = () => setActiveServerKeyword(serverSearchInput.trim());

  /* ── 클라이언트 필터링 ──────────────────────────── */
  const filteredAdjustments = adjustments.filter((adj) => {
    const matchesQuick =
      !quickFilterKeyword.trim() ||
      adj.itemCode.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      adj.itemName.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      adj.locationCode.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      adj.reason.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      adj.operatorName.toLowerCase().includes(quickFilterKeyword.toLowerCase());

    return matchesQuick;
  });

  /* ── 요약 통계 계산 ────────────────────────────── */
  const totalCount = adjustments.length;
  const increaseCount = adjustments.filter((a) => a.changeQuantity > 0).length;
  const decreaseCount = adjustments.filter((a) => a.changeQuantity < 0).length;
  const totalDiffQty = adjustments.reduce((acc, cur) => acc + cur.changeQuantity, 0);

  /* ── 신규 실재고 조정 제출 핸들러 ───────────────── */
  const handleOpenNewAdjustModal = () => {
    if (inventories.length > 0) {
      setAdjustTargetItem(inventories[0]);
    }
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (id: number, newQuantity: number, reason: string) => {
    setIsAdjustSubmitting(true);

    try {
      await adjustInventoryApi(id, { newQuantity, reason });
      toast.success('재고 실사 조정이 백엔드 DB에 성공적으로 반영되었습니다!');
      setIsAdjustModalOpen(false);
      fetchAdjustments(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '재고 조정 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setIsAdjustSubmitting(false);
    }
  };

  /* ── DataGrid 컬럼 구성 ─────────────────────────── */
  const columns: Column<StockAdjustmentRecord>[] = [
    {
      key: 'createdAt',
      header: '조정 일시',
      render: (a) => <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{a.createdAt}</span>,
    },
    {
      key: 'itemCode',
      header: '품목 코드',
      render: (a) => <span style={{ fontWeight: 600, color: '#60a5fa' }}>{a.itemCode}</span>,
    },
    {
      key: 'itemName',
      header: '품목명',
      render: (a) => <span style={{ fontWeight: 500 }}>{a.itemName}</span>,
    },
    {
      key: 'locationCode',
      header: '로케이션',
      render: (a) => <span className={styles.unitBadge}>{a.locationCode}</span>,
    },
    {
      key: 'beforeQuantity',
      header: '현재 수량',
      align: 'right',
      render: (a) => (
        <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
          {a.beforeQuantity.toLocaleString()} EA
        </span>
      ),
    },
    {
      key: 'changeQuantity',
      header: '조정 수량',
      align: 'right',
      render: (a) => {
        const isPlus = a.changeQuantity > 0;
        return (
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: isPlus ? '#4ade80' : '#f87171',
            }}
          >
            {isPlus ? `+${a.changeQuantity.toLocaleString()}` : a.changeQuantity.toLocaleString()} EA
          </span>
        );
      },
    },
    {
      key: 'afterQuantity',
      header: '조정 후 수량',
      align: 'right',
      render: (a) => (
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
          {a.afterQuantity.toLocaleString()} EA
        </span>
      ),
    },
    {
      key: 'reason',
      header: '조정 사유',
      render: (a) => <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{a.reason}</span>,
    },
    {
      key: 'operatorName',
      header: '처리자',
      render: (a) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#93c5fd', fontSize: '0.82rem' }}>
          <UserCheck size={13} />
          {a.operatorName}
        </span>
      ),
    },
  ];

  const serverBadgeText = activeServerKeyword
    ? `'${activeServerKeyword}' (${adjustments.length}건)`
    : `${adjustments.length}건`;
  const quickBadgeText = quickFilterKeyword.trim()
    ? `'${quickFilterKeyword}' (${filteredAdjustments.length}건)`
    : undefined;

  return (
    <div className={styles.container}>
      <PageHeader
        icon={<Sliders size={22} style={{ color: '#3b82f6' }} />}
        title="재고 손익 / 실사 조정 관리 (Stock Adjustment)"
        description="정기 재고 조사, 파손/분실, 오입고 수정에 따른 실재고 수량 변경 및 증감 사유 이력을 관리합니다."
      />

      {error ? (
        <ServerErrorPanel
          message={error}
          onRetry={() => fetchAdjustments(true)}
        />
      ) : isInitialLoading ? (
        <div className={styles.fullPageLoading}>
          <div className={styles.spinner} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>
            백엔드 API 서버와 연결 및 재고 조정 데이터 조회 중입니다...
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Spring Boot 백엔드 서버(http://localhost:8080)에 접속하고 있습니다.
          </p>
        </div>
      ) : (
        <>
          {/* 1단: 통계 요약 카드 3종 */}
          <StatCardGrid columns={4}>
            <StatCard
              icon={<Sliders size={16} />}
              title="총 재고 조정 건수"
              value={totalCount}
              unit="건"
              subText={`순 증감 수량: ${totalDiffQty > 0 ? '+' : ''}${totalDiffQty.toLocaleString()} EA`}
              variant="info"
            />
            <StatCard
              icon={<TrendingUp size={16} />}
              title="재고 증가 (손익+)"
              value={increaseCount}
              unit="건"
              subText="오입고 보정 / 재고 반영"
              variant="success"
            />
            <StatCard
              icon={<TrendingDown size={16} />}
              title="재고 차감 (손실-)"
              value={decreaseCount}
              unit="건"
              subText="파손 / 분실 / 실사 차감"
              variant="warning"
            />
          </StatCardGrid>

          {/* 2단: 🔍 검색 & 필터 조작 툴바 */}
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
                  placeholder="사유 / 처리자 / 실시간 필터..."
                />

                <DateRangePicker
                  label="조정 일자 범위"
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  quickRanges
                />
              </>
            }
          />

          {/* 3단: ⚡ 신규 조정 등록 버튼 바 */}
          <PageActionBar
            left={
              <>
                <button className={styles.createBtn} onClick={handleOpenNewAdjustModal}>
                  <Sliders size={16} />
                  신규 재고 실사 / 손익 조정 실행
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1', marginLeft: '0.5rem' }}>
                  <FileText size={15} style={{ color: '#60a5fa' }} />
                  <span>
                    실무자 조정 감사 이력 (총 <strong style={{ color: '#60a5fa' }}>{filteredAdjustments.length}건</strong> 조회됨)
                  </span>
                </div>
              </>
            }
          />

          {/* 4단: DataGrid 테이블 */}
          <DataGrid<StockAdjustmentRecord>
            columns={columns}
            data={filteredAdjustments}
            keyExtractor={(a) => a.id}
            loading={gridLoading}
            pagination={{
              totalElements: filteredAdjustments.length,
              page: 1,
              size: 10,
            }}
          />
        </>
      )}

      {/* 실재고 조정 모달 */}
      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        inventoryItem={adjustTargetItem}
        onSubmit={handleAdjustSubmit}
        isSubmitting={isAdjustSubmitting}
      />
    </div>
  );
};
