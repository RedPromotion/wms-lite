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
  CheckSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, PageToolbar } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { SearchInput } from '../../components/SearchInput';
import { SearchableSelect, type SelectOption } from '../../components/SearchableSelect';
import { StatCard } from '../../components/StatCard';
import { StatCardGrid } from '../../components/StatCardGrid';
import { ServerErrorPanel } from '../../components/ServerErrorPanel';
import {
  getInboundListApi,
  completeInboundApi,
  type InboundSummaryResponse,
  type InboundStatus,
} from '../../features/inbound';
import { SupplierSearchModal, ItemSearchModal } from '../../components/master-modal';
import styles from '../../styles/CommonPage.module.css';

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: '전체 상태 목록', value: 'ALL' },
  { label: '입고 대기 (REQUESTED)', value: 'REQUESTED' },
  { label: '입고 완료 (COMPLETED)', value: 'COMPLETED' },
  { label: '입고 취소 (CANCELED)', value: 'CANCELED' },
];

export const InboundListPage: React.FC = () => {
  const navigate = useNavigate();

  const [inbounds, setInbounds] = useState<InboundSummaryResponse[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 & 필터
  const [searchInput, setSearchInput] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // 마스터 모달 상태
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // 데이터 조회
  const fetchInbounds = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setGridLoading(true);
    }
    setError(null);

    try {
      const statusParam = selectedStatus !== 'ALL' ? (selectedStatus as InboundStatus) : undefined;
      const res = await getInboundListApi({
        keyword: activeKeyword || undefined,
        status: statusParam,
      });
      const listData = res?.content || (Array.isArray(res) ? res : []);
      const mapped = listData.map((item: any) => ({
        ...item,
        supplierName: item.supplierName || '공급업체 미지정',
        itemCount: item.itemCount ?? 1,
        totalQuantity: item.totalQuantity ?? 100,
        createdAt: item.createdAt ? String(item.createdAt).replace('T', ' ').substring(0, 19) : '-',
      }));
      // 최신순 (ID 역순 내림차순) 정렬
      mapped.sort((a: any, b: any) => b.id - a.id);
      setInbounds(mapped);
    } catch (err: any) {
      setError(err.message || '입고 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsInitialLoading(false);
      setGridLoading(false);
    }
  }, [activeKeyword, selectedStatus]);

  useEffect(() => {
    fetchInbounds(true);
  }, [fetchInbounds]);

  // 입고 확정/완료 실행
  const handleComplete = async (id: number, inboundNo: string) => {
    if (!window.confirm(`입고지시 [${inboundNo}] 건을 즉시 입고 완료 처리하시겠습니까?\n완료 시 수량만큼 지정 로케이션 재고가 자동 증가합니다.`)) {
      return;
    }

    try {
      await completeInboundApi(id, { description: '현장 실무자 즉시 입고 확정' });
      toast.success(`입고건 [${inboundNo}] 이(가) 성공적으로 완료 처리되었습니다. (재고가 반영됨)`);
      fetchInbounds();
    } catch (err: any) {
      const msg = err?.message || `입고건 [${inboundNo}] 완료 처리 중 오류가 발생했습니다.`;
      toast.error(msg);
    }
  };

  const handleSearchSubmit = (val?: string) => {
    const kw = val !== undefined ? val : searchInput;
    setActiveKeyword(kw.trim());
  };

  // 클라이언트 필터링
  const filteredInbounds = inbounds.filter((item) => {
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
      return false;
    }
    if (activeKeyword) {
      const kw = activeKeyword.toLowerCase();
      const matchNo = item.inboundNo?.toLowerCase().includes(kw);
      const matchSup = item.supplierName?.toLowerCase().includes(kw);
      return matchNo || matchSup;
    }
    return true;
  });

  const totalCount = filteredInbounds.length;
  const requestedCount = filteredInbounds.filter((i) => i.status === 'REQUESTED').length;
  const completedCount = filteredInbounds.filter((i) => i.status === 'COMPLETED').length;
  const canceledCount = filteredInbounds.filter((i) => i.status === 'CANCELED').length;

  const renderStatusBadge = (status: InboundStatus) => {
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
            <Clock size={12} /> 입고대기
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
            <CheckCircle2 size={12} /> 입고완료
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
            <XCircle size={12} /> 입고취소
          </span>
        );
      default:
        return status;
    }
  };

  const columns: Column<InboundSummaryResponse>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '70px',
      align: 'center',
      render: (row) => row.id,
    },
    {
      key: 'inboundNo',
      header: '입고 번호',
      width: '180px',
      render: (row) => (
        <button
          onClick={() => navigate(`/inbound/detail/${row.id}`)}
          style={{
            background: 'none',
            border: 'none',
            color: '#60a5fa',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {row.inboundNo}
        </button>
      ),
    },
    {
      key: 'supplierName',
      header: '공급업체 (Supplier)',
      render: (row) => row.supplierName || '-',
    },
    {
      key: 'status',
      header: '입고 상태',
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
      width: '180px',
      align: 'center',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate(`/inbound/detail/${row.id}`)}
            className={styles.secondaryButton}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            title="상세 보기"
          >
            <Eye size={14} /> 상세
          </button>
          {row.status === 'REQUESTED' && (
            <button
              onClick={() => handleComplete(row.id, row.inboundNo)}
              className={styles.primaryButton}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#10b981' }}
              title="입고 확정 (재고 증가)"
            >
              <CheckSquare size={14} /> 확정
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="입고 관리 (Inbound Management)"
        description="공급업체 입고지시 현황을 조회하고 신규 입고 등록 및 현장 입고 확정(재고 자동 증가)을 처리합니다."
        icon={<Truck size={24} />}
        extra={
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/inbound/create')}
          >
            <Plus size={16} />
            신규 입고 등록
          </button>
        }
      />

      {/* 요약 통계 카드 */}
      <StatCardGrid columns={4}>
        <StatCard title="전체 입고 건수" value={totalCount} unit="건" icon={<Truck size={20} />} variant="info" />
        <StatCard title="입고 대기" value={requestedCount} unit="건" icon={<Clock size={20} />} variant="warning" />
        <StatCard title="입고 완료" value={completedCount} unit="건" icon={<CheckCircle2 size={20} />} variant="success" />
        <StatCard title="입고 취소" value={canceledCount} unit="건" icon={<XCircle size={20} />} variant="danger" />
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
                placeholder="입고번호 또는 공급업체명 검색..."
              />
            </div>
            <button
              type="button"
              className={styles.secondaryButton}
              style={{ padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={() => setIsSupplierModalOpen(true)}
            >
              <Search size={14} /> 공급업체 찾기
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              style={{ padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={() => setIsItemModalOpen(true)}
            >
              <Search size={14} /> 입고품목 찾기
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
          onRetry={() => fetchInbounds(true)}
        />
      )}

      {/* 목록 그리드 */}
      <DataGrid
        title="입고 지시 및 처리 현황 목록"
        titleIcon={<Truck size={17} style={{ color: '#3b82f6' }} />}
        columns={columns}
        data={filteredInbounds}
        keyExtractor={(item) => item.id}
        loading={isInitialLoading || gridLoading}
        emptyText="조회된 입고 내역이 없습니다."
        enableExcelExport={true}
        excelFileName="WMS_입고현황_목록"
      />

      {/* 마스터 팝업 모달 2종 */}
      <SupplierSearchModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSelect={(sup: any) => {
          const name = sup.supplierName || sup.name || '';
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
