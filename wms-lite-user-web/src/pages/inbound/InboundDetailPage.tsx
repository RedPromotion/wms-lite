import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Building2,
  CheckSquare,
  Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import {
  getInboundApi,
  completeInboundApi,
  cancelInboundApi,
  type InboundResponse,
  type InboundItemResponse,
  type InboundStatus,
} from '../../features/inbound';
import styles from '../../styles/CommonPage.module.css';

export const InboundDetailPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [inbound, setInbound] = useState<InboundResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    const inboundId = Number(id);
    setLoading(true);

    try {
      const data = await getInboundApi(inboundId);
      setInbound(data);
    } catch (err: any) {
      toast.error('입고 상세 정보를 불러오는 데 실패했습니다.');
      setInbound(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // 입고 확정 처리 (완료 & 재고 증가)
  const handleComplete = async () => {
    if (!inbound) return;

    if (
      !window.confirm(
        `입고지시 [${inbound.inboundNo}] 건을 최종 입고 확정하시겠습니까?\n확정 시 입고 품목 수량만큼 해당 로케이션의 재고가 자동 증가합니다.`
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await completeInboundApi(inbound.id, { description: '입고 상세 화면에서 현장 확정 처리' });
      toast.success('입고 확정이 성공적으로 처리되었습니다. (재고 자동 증가 완료)');
      fetchDetail();
    } catch (err: any) {
      const msg = err?.message || '입고 확정 처리 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 입고 취소 처리
  const handleCancel = async () => {
    if (!inbound) return;

    if (!window.confirm(`입고지시 [${inbound.inboundNo}] 건을 취소하시겠습니까?`)) {
      return;
    }

    setSubmitting(true);
    try {
      await cancelInboundApi(inbound.id);
      toast.success('입고지시가 취소되었습니다.');
      fetchDetail();
    } catch (err: any) {
      const msg = err?.message || '입고지시 취소 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status?: InboundStatus) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span
            style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'rgba(234, 179, 8, 0.15)',
              color: '#eab308',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Clock size={14} /> 입고대기
          </span>
        );
      case 'COMPLETED':
        return (
          <span
            style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <CheckCircle2 size={14} /> 입고완료
          </span>
        );
      case 'CANCELED':
        return (
          <span
            style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <XCircle size={14} /> 입고취소
          </span>
        );
      default:
        return null;
    }
  };

  const getStepStatus = () => {
    if (!inbound) return 1;
    if (inbound.status === 'COMPLETED') return 4;
    if (inbound.status === 'CANCELED') return -1;
    return 2;
  };

  const activeStep = getStepStatus();

  const itemColumns: Column<InboundItemResponse>[] = [
    {
      key: 'itemId',
      header: 'NO',
      width: '60px',
      align: 'center',
      render: (_, index) => index + 1,
    },
    {
      key: 'itemCode',
      header: '품목 코드',
      width: '160px',
      render: (row) => <span style={{ fontWeight: 600, color: '#38bdf8' }}>{row.itemCode}</span>,
    },
    {
      key: 'itemName',
      header: '품목명',
      render: (row) => row.itemName || '-',
    },
    {
      key: 'locationCode',
      header: '로케이션 코드',
      width: '150px',
      align: 'center',
      render: (row) => (
        <span style={{ padding: '0.2rem 0.5rem', background: '#334155', borderRadius: '4px', fontSize: '0.85rem' }}>
          {row.locationCode || '-'}
        </span>
      ),
    },
    {
      key: 'locationName',
      header: '창고 및 상세 위치명',
      render: (row) => row.locationName || '-',
    },
    {
      key: 'quantity',
      header: '입고 수량',
      width: '130px',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>
          {Number(row.quantity).toLocaleString()} 개
        </span>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={`입고 상세 정보 [${inbound?.inboundNo || '조회중'}]`}
        description="입고지시의 기본 정보, 지정 품목 및 로케이션별 수량을 확인하고 현장 입고 확정(재고 자동 반영)을 진행합니다."
        icon={<Truck size={24} />}
        extra={
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/inbound/list')}
          >
            <ArrowLeft size={16} />
            목록으로
          </button>
        }
      />

      {loading ? (
        <div className={styles.fullPageLoading}>
          <div className={styles.spinner} />
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>입고 상세 정보를 불러오는 중입니다...</p>
        </div>
      ) : (
        <>
      <div
        style={{
          background: 'var(--bg-card, #1e293b)',
          border: '1px solid var(--border-color, #334155)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem' }}>
          입고 워크플로우 진행 현황
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Step 1: 입고 등록 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: activeStep >= 1 ? '#38bdf8' : '#64748b' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: activeStep >= 1 ? 'rgba(56, 189, 248, 0.2)' : '#334155',
              border: `2px solid ${activeStep >= 1 ? '#38bdf8' : '#475569'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}>
              1
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>입고 등록</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>지시서 생성 완료</div>
            </div>
          </div>

          <div style={{ height: '2px', flex: 1, minWidth: '30px', background: activeStep >= 2 ? '#38bdf8' : '#334155' }} />

          {/* Step 2: 입고 대기 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: activeStep >= 2 ? '#eab308' : '#64748b' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: activeStep >= 2 ? 'rgba(234, 179, 8, 0.2)' : '#334155',
              border: `2px solid ${activeStep >= 2 ? '#eab308' : '#475569'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}>
              2
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>입고 대기</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>현장 검수/대기중</div>
            </div>
          </div>

          <div style={{ height: '2px', flex: 1, minWidth: '30px', background: activeStep >= 4 ? '#10b981' : '#334155' }} />

          {/* Step 3: 입고 처리 & 재고 증가 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: activeStep >= 4 ? '#10b981' : '#64748b' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: activeStep >= 4 ? 'rgba(16, 185, 129, 0.2)' : '#334155',
              border: `2px solid ${activeStep >= 4 ? '#10b981' : '#475569'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}>
              3
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>입고 처리 (재고 증가)</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>로케이션 재고 자동반영</div>
            </div>
          </div>

          <div style={{ height: '2px', flex: 1, minWidth: '30px', background: activeStep >= 4 ? '#10b981' : '#334155' }} />

          {/* Step 4: 입고 완료 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: activeStep >= 4 ? '#22c55e' : '#64748b' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: activeStep >= 4 ? 'rgba(34, 197, 94, 0.2)' : '#334155',
              border: `2px solid ${activeStep >= 4 ? '#22c55e' : '#475569'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>입고 완료</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>최종 확정됨</div>
            </div>
          </div>
        </div>
      </div>

      {/* 입고 기본정보 카드 */}
      <div className={styles.filterSection} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} style={{ color: '#3b82f6' }} />
            입고 기본정보
          </h3>
          <div>{renderStatusBadge(inbound?.status)}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', paddingTop: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>입고 번호</span>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>{inbound?.inboundNo || '-'}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>공급업체 (Supplier)</span>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              {inbound?.supplierName ? `${inbound.supplierName} ${inbound.supplierCode ? `(${inbound.supplierCode})` : ''}` : '-'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>등록 일시</span>
            <span style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>
              {inbound?.createdAt ? String(inbound.createdAt).replace('T', ' ').substring(0, 19) : '-'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>입고 완료 일시</span>
            <span style={{ fontSize: '0.95rem', color: inbound?.completedAt ? '#4ade80' : '#64748b' }}>
              {inbound?.completedAt ? String(inbound.completedAt).replace('T', ' ').substring(0, 19) : '미완료'}
            </span>
          </div>
        </div>
      </div>

      {/* 입고 품목 목록 카드 */}
      <div className={styles.filterSection} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={18} style={{ color: '#10b981' }} />
          입고 품목 / 수량 / 지정 로케이션 목록
        </h3>

        <DataGrid
          columns={itemColumns}
          data={inbound?.items || []}
          keyExtractor={(item) => item.itemId}
          loading={loading}
          emptyText="입고 품목 데이터가 없습니다."
        />
      </div>

      {/* 입고 상태 제어 액션 바 */}
      {inbound?.status === 'REQUESTED' && (
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid #334155',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.2rem' }}>
              현장 입고 확정 처리
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              '입고 확정' 클릭 시 해당 품목 수량이 지정된 각 로케이션 재고에 즉시 더해집니다.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancel}
              disabled={submitting}
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            >
              <Ban size={16} />
              입고 지시 취소
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleComplete}
              disabled={submitting}
              style={{ background: '#10b981', padding: '0.6rem 1.25rem', fontSize: '0.95rem' }}
            >
              <CheckSquare size={18} />
              {submitting ? '처리 중...' : '입고 확정 (재고 증가)'}
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
