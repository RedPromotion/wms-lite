import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Layers,
} from 'lucide-react';
import { PageHeader, PageToolbar } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { SearchInput } from '../../components/SearchInput';
import { SearchableSelect, type SelectOption } from '../../components/SearchableSelect';
import { StatCard } from '../../components/StatCard';
import { StatCardGrid } from '../../components/StatCardGrid';
import { ServerErrorPanel } from '../../components/ServerErrorPanel';
import {
  getOutboundListApi,
  type OutboundSummaryResponse,
  type OutboundStatus,
} from '../../features/outbound';
import { CustomerSearchModal, ItemSearchModal } from '../../components/master-modal';
import styles from '../../styles/CommonPage.module.css';

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: '전체 상태 목록', value: 'ALL' },
  { label: '출고 요청 (REQUESTED)', value: 'REQUESTED' },
  { label: '피킹중 (PICKING)', value: 'PICKING' },
  { label: '출고 완료 (COMPLETED)', value: 'COMPLETED' },
  { label: '출고 취소 (CANCELED)', value: 'CANCELED' },
];

export const OutboundListPage: React.FC = () => {
  const navigate = useNavigate();

  const [outbounds, setOutbounds] = useState<OutboundSummaryResponse[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 & 필터
  const [searchInput, setSearchInput] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // 마스터 모달 상태
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // 데이터 조회
  const fetchOutbounds = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setGridLoading(true);
    }
    setError(null);

    try {
      const statusParam = selectedStatus !== 'ALL' ? (selectedStatus as OutboundStatus) : undefined;
      const res = await getOutboundListApi({
        keyword: activeKeyword || undefined,
        status: statusParam,
      });
      const listData = res?.content || (Array.isArray(res) ? res : []);
      const mapped = listData.map((item: any) => ({
        ...item,
        customerName: item.customerName || '고객사 미지정',
        itemCount: item.itemCount ?? 1,
        totalQuantity: item.totalQuantity ?? 50,
        createdAt: item.createdAt ? String(item.createdAt).replace('T', ' ').substring(0, 19) : '-',
      }));
      // 최신순 (ID 역순 내림차순) 정렬
      mapped.sort((a: any, b: any) => b.id - a.id);
      setOutbounds(mapped);
    } catch (err: any) {
      setError(err.message || '출고 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsInitialLoading(false);
      setGridLoading(false);
    }
  }, [activeKeyword, selectedStatus]);

  useEffect(() => {
    fetchOutbounds(true);
  }, [fetchOutbounds]);

  const handleSearchSubmit = (val?: string) => {
    const kw = val !== undefined ? val : searchInput;
    setActiveKeyword(kw.trim());
  };

  // 필터링
  const filteredOutbounds = outbounds.filter((item) => {
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
      return false;
    }
    if (activeKeyword) {
      const kw = activeKeyword.toLowerCase();
      const matchNo = item.outboundNo?.toLowerCase().includes(kw);
      const matchCust = item.customerName?.toLowerCase().includes(kw);
      return matchNo || matchCust;
    }
    return true;
  });

  const totalCount = filteredOutbounds.length;
  const requestedCount = filteredOutbounds.filter((i) => i.status === 'REQUESTED').length;
  const pickingCount = filteredOutbounds.filter((i) => i.status === 'PICKING').length;
  const completedCount = filteredOutbounds.filter((i) => i.status === 'COMPLETED').length;
  const canceledCount = filteredOutbounds.filter((i) => i.status === 'CANCELED').length;

  const renderStatusBadge = (status: OutboundStatus) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: 'rgba(234, 179, 8, 0.15)',
            color: '#eab308',
            border: '1px solid rgba(234, 179, 8, 0.3)',
          }}>
            <Clock size={12} /> 출고요청
          </span>
        );
      case 'PICKING':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}>
            <Layers size={12} /> 피킹중
          </span>
        );
      case 'COMPLETED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}>
            <CheckCircle2 size={12} /> 출고완료
          </span>
        );
      case 'CANCELED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}>
            <XCircle size={12} /> 출고취소
          </span>
        );
      default:
        return status;
    }
  };

  const columns: Column<OutboundSummaryResponse>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '70px',
      align: 'center',
      render: (row) => row.id,
    },
    {
      key: 'outboundNo',
      header: '출고 번호',
      width: '180px',
      render: (row) => (
        <button
          onClick={() => navigate(`/outbound/detail/${row.id}`)}
          style={{
            background: 'none',
            border: 'none',
            color: '#60a5fa',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {row.outboundNo}
        </button>
      ),
    },
    {
      key: 'customerName',
      header: '고객사 (Customer)',
      render: (row) => row.customerName || '-',
    },
    {
      key: 'status',
      header: '출고 상태',
      width: '130px',
      align: 'center',
      render: (row) => renderStatusBadge(row.status),
    },
    {
      key: 'createdAt',
      header: '등록 일시',
      width: '180px',
      align: 'center',
      render: (row) => (row.createdAt ? String(row.createdAt).replace('T', ' ').substring(0, 19) : '-'),
    },
    {
      key: 'actions',
      header: '관리 액션',
      width: '120px',
      align: 'center',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate(`/outbound/detail/${row.id}`)}
            className={styles.secondaryButton}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
            title="출고 상세 및 피킹 작업"
          >
            <Eye size={14} /> 상세/피킹
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="출고 및 피킹 관리 (Outbound Management)"
        description="출고지시 현황을 조회하고 신규 출고 등록 및 출고 상세 내 피킹(Picking) 작업/출고 확정을 처리합니다."
        icon={<Truck size={24} />}
        extra={
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/outbound/create')}
          >
            <Plus size={16} />
            신규 출고 등록
          </button>
        }
      />

      {/* 요약 통계 카드 */}
      <StatCardGrid columns={5}>
        <StatCard title="전체 출고 건수" value={totalCount} unit="건" icon={<Truck size={20} />} variant="info" />
        <StatCard title="출고 요청" value={requestedCount} unit="건" icon={<Clock size={20} />} variant="warning" />
        <StatCard title="피킹 진행중" value={pickingCount} unit="건" icon={<Layers size={20} />} variant="purple" />
        <StatCard title="출고 완료" value={completedCount} unit="건" icon={<CheckCircle2 size={20} />} variant="success" />
        <StatCard title="출고 취소" value={canceledCount} unit="건" icon={<XCircle size={20} />} variant="danger" />
      </StatCardGrid>

      {/* 검색 & 필터 툴바 */}
      <PageToolbar
        left={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '200px' }}>
              <SearchableSelect
                options={STATUS_FILTER_OPTIONS}
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val || 'ALL')}
              />
            </div>
            <div style={{ width: '300px' }}>
              <SearchInput
                value={searchInput}
                onChange={(val) => setSearchInput(val)}
                onSearch={handleSearchSubmit}
                placeholder="출고번호 또는 고객사명 검색..."
              />
            </div>
            <button
              type="button"
              className={styles.secondaryButton}
              style={{ padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={() => setIsCustomerModalOpen(true)}
            >
              <Search size={14} /> 고객사 찾기
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              style={{ padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={() => setIsItemModalOpen(true)}
            >
              <Search size={14} /> 출고품목 찾기
            </button>
          </div>
        }
        right={
          <button type="button" className={styles.primaryButton} onClick={() => handleSearchSubmit()}>
            <Search size={16} />
            검색
          </button>
        }
      />

      {error && (
        <ServerErrorPanel
          message={error}
          onRetry={() => fetchOutbounds(true)}
        />
      )}

      {/* 목록 그리드 */}
      <DataGrid
        title="출고 및 피킹 현황 목록"
        titleIcon={<Truck size={17} style={{ color: '#3b82f6' }} />}
        columns={columns}
        data={filteredOutbounds}
        keyExtractor={(item) => item.id}
        loading={isInitialLoading || gridLoading}
        emptyText="조회된 출고 내역이 없습니다."
        enableExcelExport={true}
        excelFileName="WMS_출고현황_목록"
      />

      {/* 마스터 팝업 모달 2종 */}
      <CustomerSearchModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelect={(cust: any) => {
          const name = cust.customerName || cust.name || '';
          setSearchInput(name);
          handleSearchSubmit(name);
        }}
      />

      <ItemSearchModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSelect={(item: any) => {
          const code = item.itemCode || item.code || item.itemName || item.name || '';
          setSearchInput(code);
          handleSearchSubmit(code);
        }}
      />
    </div>
  );
};
