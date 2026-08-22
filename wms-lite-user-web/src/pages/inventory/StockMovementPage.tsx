import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  CheckSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, PageToolbar, PageActionBar } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import { SearchInput } from '../../components/SearchInput';
import { SearchableSelect, type SelectOption } from '../../components/SearchableSelect';
import { ServerErrorPanel } from '../../components/ServerErrorPanel';
import { MovementCreateModal } from './MovementCreateModal';
import { MovementCompleteModal } from './MovementCompleteModal';
import {
  getMovementListApi,
  createMovementApi,
  completeMovementApi,
  cancelMovementApi,
  type MovementSummaryResponse,
  type MovementStatus,
  type MovementCreateRequest,
  type MovementCompleteRequest,
} from '../../features/stockmovement';
import { ItemSearchModal, LocationSearchModal } from '../../components/master-modal';
import styles from '../../styles/CommonPage.module.css';

/* ── 상태 배지 컴포넌트 ──────────────────────────── */
const StatusBadge: React.FC<{ status: MovementStatus }> = ({ status }) => {
  switch (status) {
    case 'REQUESTED':
      return (
        <span style={{ color: '#facc15', background: 'rgba(250, 204, 21, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
          요청 대기
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span style={{ color: '#60a5fa', background: 'rgba(96, 165, 250, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
          이동 중
        </span>
      );
    case 'COMPLETED':
      return (
        <span style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
          이동 완료
        </span>
      );
    case 'CANCELED':
      return (
        <span style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
          취소됨
        </span>
      );
    default:
      return <span>{status}</span>;
  }
};

/* ── 상태 필터 드롭다운 옵션 ──────────────────────────── */
const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: '전체 이동 현황', value: 'ALL' },
  { label: '⏳ 요청 대기 (REQUESTED)', value: 'REQUESTED' },
  { label: '🚚 이동 진행 중 (IN_PROGRESS)', value: 'IN_PROGRESS' },
  { label: '✅ 이동 완료 (COMPLETED)', value: 'COMPLETED' },
  { label: '✖ 취소됨 (CANCELED)', value: 'CANCELED' },
];

export const StockMovementPage: React.FC = () => {
  const [movements, setMovements] = useState<MovementSummaryResponse[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [gridLoading, setGridLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 상태
  const [serverSearchInput, setServerSearchInput] = useState('');
  const [activeServerKeyword, setActiveServerKeyword] = useState('');
  const [quickFilterKeyword, setQuickFilterKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // 마스터 모달 상태
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // 체크박스 선택
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // 등록 모달
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  // 확정 모달
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<MovementSummaryResponse | null>(null);
  const [isCompleteSubmitting, setIsCompleteSubmitting] = useState(false);

  /* ── 데이터 조회 ─────────────────────────────────── */
  const fetchMovements = useCallback(
    async (isInitial = false) => {
      if (isInitial) setIsInitialLoading(true);
      else setGridLoading(true);
      setError(null);

      try {
        const pageData = await getMovementListApi({
          status: selectedStatus !== 'ALL' ? (selectedStatus as MovementStatus) : undefined,
          size: 50,
        });

        const mapped: MovementSummaryResponse[] = (pageData.content || []).map((dto) => ({
          id: dto.id,
          movementCode: dto.movementCode,
          fromLocationCode: dto.fromLocationCode,
          toLocationCode: dto.toLocationCode,
          itemName: dto.itemName,
          quantity: dto.quantity,
          status: dto.status,
          requestedAt: dto.requestedAt
            ? dto.requestedAt.replace('T', ' ').substring(0, 19)
            : '-',
        }));

        // 최신순 (ID 역순 내림차순) 정렬
        mapped.sort((a, b) => b.id - a.id);

        setMovements(mapped);
      } catch (err: unknown) {
        const msg =
          (err as { message?: string }).message ||
          '백엔드 API 서버(http://localhost:8080)와 통신할 수 없습니다.';
        setError(msg);
      } finally {
        setIsInitialLoading(false);
        setGridLoading(false);
      }
    },
    [selectedStatus]
  );

  useEffect(() => { fetchMovements(true); }, []);
  useEffect(() => { fetchMovements(false); }, [activeServerKeyword, selectedStatus, fetchMovements]);

  const handleServerSearch = () => setActiveServerKeyword(serverSearchInput.trim());

  /* ── 클라이언트 필터 ─────────────────────────────── */
  const filteredMovements = movements.filter((m) => {
    const matchesQuick =
      !quickFilterKeyword.trim() ||
      m.movementCode.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      m.itemName.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      m.fromLocationCode.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
      m.toLocationCode.toLowerCase().includes(quickFilterKeyword.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' || m.status === selectedStatus;

    return matchesQuick && matchesStatus;
  });

  /* ── 등록 핸들러 ─────────────────────────────────── */
  const handleCreateSubmit = async (data: MovementCreateRequest) => {
    setIsCreateSubmitting(true);
    try {
      await createMovementApi(data);
      toast.success('재고 이동 요청이 백엔드 DB에 성공적으로 등록되었습니다!');
      setIsCreateModalOpen(false);
      fetchMovements(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '이동 요청 등록 중 오류가 발생했습니다.';
      toast.error(msg);
      throw err;
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  /* ── 확정 핸들러 ─────────────────────────────────── */
  const handleOpenCompleteModal = (item?: MovementSummaryResponse) => {
    if (item) {
      setCompleteTarget(item);
      setIsCompleteModalOpen(true);
      return;
    }
    const actionable = movements.filter(
      (m) => selectedIds.includes(m.id) && (m.status === 'REQUESTED' || m.status === 'IN_PROGRESS')
    );
    if (actionable.length === 0) {
      toast.error('확정 가능한 항목(요청 대기/진행 중)을 선택해 주세요.');
      return;
    }
    if (actionable.length > 1) {
      toast.error('확정은 한 번에 1건씩 처리해 주세요.');
      return;
    }
    setCompleteTarget(actionable[0]);
    setIsCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (id: number, data: MovementCompleteRequest) => {
    setIsCompleteSubmitting(true);
    try {
      await completeMovementApi(id, data);
      toast.success('재고 이동 확정이 백엔드 DB에 성공적으로 반영되었습니다!');
      setIsCompleteModalOpen(false);
      setSelectedIds([]);
      fetchMovements(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || '이동 확정 중 오류가 발생했습니다.';
      toast.error(msg);
      throw err;
    } finally {
      setIsCompleteSubmitting(false);
    }
  };

  /* ── 취소 핸들러 ─────────────────────────────────── */
  const handleCancelSelected = async () => {
    const cancelable = movements.filter(
      (m) => selectedIds.includes(m.id) && (m.status === 'REQUESTED' || m.status === 'IN_PROGRESS')
    );
    if (cancelable.length === 0) {
      toast.error('취소 가능한 항목(요청 대기/진행 중)을 선택해 주세요.');
      return;
    }
    if (!window.confirm(`선택한 ${cancelable.length}건의 이동 요청을 취소하시겠습니까?`)) return;

    try {
      await Promise.all(cancelable.map((m) => cancelMovementApi(m.id)));
      toast.success(`${cancelable.length}건 취소 처리가 완료되었습니다.`);
      setSelectedIds([]);
      fetchMovements(false);
    } catch {
      toast.error('일부 항목 취소 처리 중 오류가 발생했습니다.');
    }
  };

  /* ── DataGrid 컬럼 ───────────────────────────────── */
  const columns: Column<MovementSummaryResponse>[] = [
    {
      key: 'movementCode',
      header: '이동 번호',
      render: (m) => (
        <span style={{ fontWeight: 600, color: '#38bdf8' }}>
          {m.movementCode || (m as any).movementNo || `MOV-${m.id}`}
        </span>
      ),
    },
    {
      key: 'itemName',
      header: '품목명',
      render: (m) => <span style={{ fontWeight: 500 }}>{m.itemName || '-'}</span>,
    },
    {
      key: 'fromLocationCode',
      header: '이동 경로 (From → To)',
      render: (m) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
          }}
        >
          <span className={styles.unitBadge}>{m.fromLocationCode || '-'}</span>
          <ArrowRightLeft size={12} style={{ color: '#64748b', flexShrink: 0 }} />
          <span className={styles.unitBadge}>{m.toLocationCode || '-'}</span>
        </span>
      ),
    },
    {
      key: 'quantity',
      header: '이동 수량',
      align: 'right',
      render: (m) => (
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
          {(m.quantity ?? 0).toLocaleString()} EA
        </span>
      ),
    },
    {
      key: 'status',
      header: '진행 상태',
      align: 'center',
      render: (m) => <StatusBadge status={m.status} />,
    },
    {
      key: 'requestedAt',
      header: '요청 일시',
      render: (m) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8' }}>
          {m.requestedAt}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '처리',
      align: 'center',
      render: (m) =>
        m.status === 'REQUESTED' || m.status === 'IN_PROGRESS' ? (
          <div className={styles.rowActionGroup}>
            <button
              className={styles.iconBtn}
              title="이동 확정"
              onClick={() => handleOpenCompleteModal(m)}
              style={{ width: 'auto', padding: '0 0.5rem', gap: '0.2rem', fontSize: '0.75rem', color: '#4ade80' }}
            >
              <CheckCircle size={13} />
              확정
            </button>
          </div>
        ) : null,
    },
  ];

  const serverBadgeText = activeServerKeyword
    ? `'${activeServerKeyword}' (${movements.length}건)`
    : `${movements.length}건`;
  const quickBadgeText = quickFilterKeyword.trim()
    ? `'${quickFilterKeyword}' (${filteredMovements.length}건)`
    : undefined;

  /* ── 렌더 ────────────────────────────────────────── */
  return (
    <div className={styles.container}>
      <PageHeader
        icon={<ArrowRightLeft size={22} style={{ color: '#3b82f6' }} />}
        title="재고 이동 관리 (Stock Movement)"
        description="창고 내/창고 간 로케이션 이동 요청을 등록하고, 이동 진행 상태를 확인 및 확정 처리합니다."
      />

      {error ? (
        <ServerErrorPanel
          message={error}
          onRetry={() => fetchMovements(true)}
        />
      ) : isInitialLoading ? (
        <div className={styles.fullPageLoading}>
          <div className={styles.spinner} />
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>
            백엔드 API 서버와 연결 및 재고 이동 데이터 조회 중입니다...
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Spring Boot 백엔드 서버(http://localhost:8080)에 접속하고 있습니다.
          </p>
        </div>
      ) : (
        <>
          {/* 검색 & 필터 툴바 */}
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
                  placeholder="이동코드 / 품목명 (Enter/조회)"
                />
                <SearchInput
                  label="상세검색 (결과 내 빠른 필터)"
                  badgeText={quickBadgeText}
                  badgeType="quick"
                  value={quickFilterKeyword}
                  onChange={setQuickFilterKeyword}
                  placeholder="로케이션 / 품목명 실시간 필터..."
                />
                <div className={styles.categorySelectWrapper}>
                  <span className={styles.selectLabel}>진행 상태 선택</span>
                  <SearchableSelect
                    options={STATUS_FILTER_OPTIONS}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    placeholder="상태 선택"
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

          {/* 액션 버튼 바 */}
          <PageActionBar
            left={
              <>
                <button
                  className={styles.createBtn}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <ArrowRightLeft size={16} />
                  재고 이동 요청 등록
                </button>
                <button
                  className={styles.editBtn}
                  onClick={() => handleOpenCompleteModal()}
                >
                  <CheckCircle size={15} />
                  선택 확정
                </button>
                <button
                  className={styles.editBtn}
                  onClick={handleCancelSelected}
                  style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                >
                  <XCircle size={15} />
                  선택 취소
                </button>
                {selectedIds.length > 0 && (
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
                    선택된 항목: {selectedIds.length}개
                  </div>
                )}
              </>
            }
          />

          <DataGrid<MovementSummaryResponse>
            columns={columns}
            data={filteredMovements}
            keyExtractor={(m) => m.id}
            selectable
            selectedKeys={selectedIds}
            onSelectionChange={setSelectedIds}
            loading={gridLoading}
            pagination={{
              totalElements: filteredMovements.length,
              page: 1,
              size: 10,
            }}
          />
        </>
      )}

      {/* 모달 */}
      <MovementCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isCreateSubmitting}
      />
      <MovementCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        targetMovement={completeTarget}
        onSubmit={handleCompleteSubmit}
        isSubmitting={isCompleteSubmitting}
      />

      <ItemSearchModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSelect={(item: any) => {
          const name = item.itemName || item.name || item.itemCode || item.code || '';
          setQuickFilterKeyword(name);
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
