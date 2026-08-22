import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  RefreshCcw,
  History,
  Eye,
} from 'lucide-react';
import { PageHeader, PageToolbar, PageActionBar } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { SearchInput } from '../../components/SearchInput';
import { SearchableSelect, type SelectOption } from '../../components/SearchableSelect';
import { ServerErrorPanel } from '../../components/ServerErrorPanel';
import { DateRangePicker } from '../../components/DateRangePicker';
import { StatCard } from '../../components/StatCard';
import { StatCardGrid } from '../../components/StatCardGrid';
import {
  getStockHistoryListApi,
  type StockHistorySummaryResponse,
  type HistoryType,
} from '../../features/stockhistory';
import {
  StockHistoryDetailModal,
  type StockHistoryDetailItem,
} from '../../components/StockHistoryDetailModal';
import styles from '../../styles/CommonPage.module.css';

const HISTORY_TYPE_OPTIONS: SelectOption[] = [
  { label: '전체 수불 유형', value: 'ALL' },
  { label: '📥 입고 실적 (INBOUND)', value: 'INBOUND' },
  { label: '📤 출고 실적 (OUTBOUND)', value: 'OUTBOUND' },
  { label: '🎛️ 재고 손익 조정 (ADJUSTMENT)', value: 'ADJUSTMENT' },
  { label: '🚚 창고/로케이션 이동 (MOVEMENT)', value: 'MOVEMENT' },
];

export const StockHistoryPage: React.FC = () => {
  const [histories, setHistories] = useState<StockHistorySummaryResponse[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 수불 상세 모달 상태
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<StockHistoryDetailItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const [serverSearchInput, setServerSearchInput] = useState('');
  const [activeServerKeyword, setActiveServerKeyword] = useState('');
  const [quickFilterKeyword, setQuickFilterKeyword] = useState('');
  const [selectedHistoryType, setSelectedHistoryType] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStockHistories = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setGridLoading(true);
    }
    setError(null);

    try {
      const pageData = await getStockHistoryListApi({
        keyword: activeServerKeyword || undefined,
        historyType: selectedHistoryType !== 'ALL' && selectedHistoryType !== 'MOVEMENT'
          ? (selectedHistoryType as HistoryType)
          : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        size: 50,
      });

      const mapped: StockHistorySummaryResponse[] = (pageData.content || []).map((dto) => ({
        id: dto.id,
        itemCode: dto.itemCode || 'ITM-UNKNOWN',
        itemName: dto.itemName || '품목명 없음',
        locationCode: dto.locationCode || '미지정',
        historyType: dto.historyType,
        beforeQuantity: dto.beforeQuantity ?? null,
        changeQuantity: dto.changeQuantity,
        afterQuantity: dto.afterQuantity ?? null,
        referenceNo: dto.referenceNo || undefined,
        description: dto.description || undefined,
        sourceLocation: dto.sourceLocation || undefined,
        targetLocation: dto.targetLocation || undefined,
        partnerName: dto.partnerName || undefined,
        createdAt: dto.createdAt ? dto.createdAt.replace('T', ' ').substring(0, 19) : '-',
      }));

      setHistories(mapped);
    } catch (err: unknown) {
      const errorMessage =
        (err as { message?: string }).message ||
        '백엔드 API 서버(http://localhost:8080)와 통신할 수 없습니다.';
      setError(errorMessage);
    } finally {
      setIsInitialLoading(false);
      setGridLoading(false);
    }
  }, [activeServerKeyword, selectedHistoryType, startDate, endDate]);

  useEffect(() => {
    fetchStockHistories(true);
  }, []);

  useEffect(() => {
    fetchStockHistories(false);
  }, [activeServerKeyword, selectedHistoryType, startDate, endDate, fetchStockHistories]);

  const handleServerSearch = () => {
    setActiveServerKeyword(serverSearchInput.trim());
  };

  const filteredHistories = histories.filter((h) => {
    const matchesQuick =
      !quickFilterKeyword.trim() ||
      h.itemCode.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      h.itemName.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      (h.locationCode && h.locationCode.toLowerCase().includes(quickFilterKeyword.toLowerCase()));

    const matchesType =
      selectedHistoryType === 'ALL'
        ? true
        : selectedHistoryType === 'MOVEMENT'
          ? h.historyType === 'MOVEMENT_IN' || h.historyType === 'MOVEMENT_OUT'
          : h.historyType === selectedHistoryType;

    return matchesQuick && matchesType;
  });

  const renderHistoryTypeBadge = (type: HistoryType) => {
    switch (type) {
      case 'INBOUND':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            <ArrowDownLeft size={13} />
            입고 (INBOUND)
          </span>
        );
      case 'OUTBOUND':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              background: 'rgba(249, 115, 22, 0.15)',
              color: '#fb923c',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            <ArrowUpRight size={13} />
            출고 (OUTBOUND)
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            <Sliders size={13} />
            재고 손익 조정
          </span>
        );
      case 'MOVEMENT_IN':
      case 'MOVEMENT_OUT':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            <RefreshCcw size={13} />
            로케이션 이동 ({type === 'MOVEMENT_IN' ? '입고' : '출고'})
          </span>
        );
      default:
        return <span>{type}</span>;
    }
  };

  const columns: Column<StockHistorySummaryResponse>[] = [
    {
      key: 'createdAt',
      header: '수불 변동 일시',
      render: (h) => <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{h.createdAt}</span>,
    },
    {
      key: 'historyType',
      header: '수불 구사 구분',
      render: (h) => renderHistoryTypeBadge(h.historyType),
    },
    {
      key: 'itemCode',
      header: '품목 코드',
      render: (h) => <span style={{ fontWeight: 600, color: '#60a5fa' }}>{h.itemCode}</span>,
    },
    {
      key: 'itemName',
      header: '품목명',
      render: (h) => <span style={{ fontWeight: 500 }}>{h.itemName}</span>,
    },
    {
      key: 'locationCode',
      header: '로케이션',
      render: (h) => <span className={styles.unitBadge}>{h.locationCode || '미지정'}</span>,
    },
    {
      key: 'beforeQuantity',
      header: '변동 전 잔량',
      align: 'right',
      render: (h) => (
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          {h.beforeQuantity != null ? `${h.beforeQuantity.toLocaleString()} EA` : '-'}
        </span>
      ),
    },
    {
      key: 'changeQuantity',
      header: '증감 수량',
      align: 'right',
      render: (h) => {
        const isPlus = h.changeQuantity > 0;
        return (
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: isPlus ? '#4ade80' : '#f87171',
            }}
          >
            {isPlus ? `+${h.changeQuantity.toLocaleString()}` : h.changeQuantity.toLocaleString()} EA
          </span>
        );
      },
    },
    {
      key: 'afterQuantity',
      header: '변동 후 잔량',
      align: 'right',
      render: (h) => (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
          {h.afterQuantity != null ? `${h.afterQuantity.toLocaleString()} EA` : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '수불 상세',
      align: 'center',
      render: (h) => {
        const rawType = String(h.historyType || '');
        const normType: any = rawType.includes('MOVEMENT')
          ? 'MOVEMENT'
          : rawType.includes('INBOUND')
            ? 'INBOUND'
            : rawType.includes('OUTBOUND')
              ? 'OUTBOUND'
              : 'ADJUSTMENT';

        return (
          <button
            type="button"
            className={styles.secondaryButton}
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            onClick={() => {
              const refNo = h.referenceNo || `TRX-${h.id}`;
              const desc = h.description || `${normType} 수불 변동 이력`;

              setSelectedHistoryItem({
                id: h.id,
                itemCode: h.itemCode,
                itemName: h.itemName,
                locationCode: h.locationCode || '미지정',
                historyType: normType,
                beforeQuantity: h.beforeQuantity ?? 0,
                changeQuantity: h.changeQuantity,
                afterQuantity: h.afterQuantity ?? 0,
                referenceNo: refNo,
                createdAt: h.createdAt || '-',
                description: desc,
                sourceLocation: h.sourceLocation,
                targetLocation: h.targetLocation,
                partnerName: h.partnerName,
              });
              setIsDetailModalOpen(true);
            }}
          >
            <Eye size={13} /> 상세
          </button>
        );
      },
    },
  ];

  // 요약 카드 집계 (전체 histories 기준)
  const summary = {
    inbound: {
      count: histories.filter((h) => h.historyType === 'INBOUND').length,
      total: histories.filter((h) => h.historyType === 'INBOUND').reduce((s, h) => s + h.changeQuantity, 0),
    },
    outbound: {
      count: histories.filter((h) => h.historyType === 'OUTBOUND').length,
      total: Math.abs(histories.filter((h) => h.historyType === 'OUTBOUND').reduce((s, h) => s + h.changeQuantity, 0)),
    },
    movement: {
      count: histories.filter((h) => h.historyType === 'MOVEMENT_IN' || h.historyType === 'MOVEMENT_OUT').length,
      total: histories.filter((h) => h.historyType === 'MOVEMENT_IN').reduce((s, h) => s + h.changeQuantity, 0),
    },
    adjustment: {
      count: histories.filter((h) => h.historyType === 'ADJUSTMENT').length,
      total: histories.filter((h) => h.historyType === 'ADJUSTMENT').reduce((s, h) => s + h.changeQuantity, 0),
    },
  };

  const serverBadgeText = activeServerKeyword
    ? `'${activeServerKeyword}' (${histories.length}건)`
    : `${histories.length}건`;
  const quickBadgeText = quickFilterKeyword.trim()
    ? `'${quickFilterKeyword}' (${filteredHistories.length}건)`
    : undefined;

  return (
    <div className={styles.container}>
      <PageHeader
        icon={<History size={22} style={{ color: '#3b82f6' }} />}
        title="재고 수불 이력 (Stock History Audit Log)"
        description="입고, 출고, 재고 이동, 손익 조정으로 발생한 모든 재고 증감 실적 감사 추적(Audit Log)을 모니터링합니다."
      />

      {error ? (
        <ServerErrorPanel
          message={error}
          onRetry={() => fetchStockHistories(true)}
        />
      ) : isInitialLoading ? (
        <div className={styles.fullPageLoading}>
          <div className={styles.spinner} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>
            백엔드 API 서버와 연결 및 수불 이력 데이터 조회 중입니다...
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Spring Boot 백엔드 서버(http://localhost:8080)에 접속하고 있습니다.
          </p>
        </div>
      ) : (
        <>
          {/* 요약 카드 그리드 */}
          <StatCardGrid columns={4}>
            <StatCard
              icon="📥"
              title="입고 (INBOUND)"
              value={summary.inbound.count}
              unit="건"
              subText={`합계 +${summary.inbound.total.toLocaleString()} EA`}
              variant="success"
            />
            <StatCard
              icon="📤"
              title="출고 (OUTBOUND)"
              value={summary.outbound.count}
              unit="건"
              subText={`합계 -${summary.outbound.total.toLocaleString()} EA`}
              variant="warning"
            />
            <StatCard
              icon="🔄"
              title="이동 (MOVEMENT)"
              value={summary.movement.count}
              unit="건"
              subText={`합계 ${summary.movement.total > 0 ? '+' : ''}${summary.movement.total.toLocaleString()} EA`}
              variant="info"
            />
            <StatCard
              icon="🎛️"
              title="조정 (ADJUSTMENT)"
              value={summary.adjustment.count}
              unit="건"
              subText={`합계 ${summary.adjustment.total > 0 ? '+' : ''}${summary.adjustment.total.toLocaleString()} EA`}
              variant="purple"
            />
          </StatCardGrid>

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
                  <span className={styles.selectLabel}>수불 구분 선택</span>
                  <SearchableSelect
                    options={HISTORY_TYPE_OPTIONS}
                    value={selectedHistoryType}
                    onChange={setSelectedHistoryType}
                    placeholder="수불 구사 선택"
                  />
                </div>

                <DateRangePicker
                  label="수불 날짜 범위"
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

          {/* 2단 라인: ⚡ 액션 라인 (PageActionBar) */}
          <PageActionBar
            left={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <FileText size={16} style={{ color: '#60a5fa' }} />
                <span>
                  수불 변동 이력 타임라인 (총 <strong style={{ color: '#60a5fa' }}>{filteredHistories.length}건</strong> 조회됨)
                </span>
              </div>
            }
          />

          <DataGrid<StockHistorySummaryResponse>
            title="재고 수불 변동 감사로그 목록"
            titleIcon={<History size={17} style={{ color: '#3b82f6' }} />}
            columns={columns}
            data={filteredHistories}
            keyExtractor={(h) => h.id}
            loading={gridLoading}
            enableExcelExport={true}
            excelFileName="WMS_재고수불이력_감사로그"
            pagination={{
              totalElements: filteredHistories.length,
              page: 1,
              size: 10,
            }}
          />
        </>
      )}

      <StockHistoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        historyItem={selectedHistoryItem}
      />
    </div>
  );
};
