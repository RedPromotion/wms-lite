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
  Layers,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { DataGrid, type Column } from '../../components/DataGrid';
import {
  getOutboundApi,
  completeOutboundApi,
  cancelOutboundApi,
  type OutboundResponse,
  type OutboundItemResponse,
  type OutboundStatus,
} from '../../features/outbound';
import styles from '../../styles/CommonPage.module.css';

export const OutboundDetailPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [outbound, setOutbound] = useState<OutboundResponse | null>(null);
  const [items, setItems] = useState<OutboundItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    const outboundId = Number(id);
    setLoading(true);

    try {
      const data = await getOutboundApi(outboundId);
      setOutbound(data);
      // 피킹 수량 초기화 (기존 값이 없으면 0)
      const initializedItems = (data.items || []).map((item) => ({
        ...item,
        pickedQuantity: item.pickedQuantity ?? (data.status === 'COMPLETED' ? item.quantity : 0),
      }));
      setItems(initializedItems);
    } catch {
      toast.error('출고 상세 정보를 불러오는 데 실패했습니다.');
      setOutbound(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // 피킹 수량 조절
  const handlePickedQtyChange = (itemId: number, newQty: number) => {
    if (outbound?.status === 'COMPLETED' || outbound?.status === 'CANCELED') return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          const validQty = Math.max(0, Math.min(item.quantity, newQty));
          return { ...item, pickedQuantity: validQty };
        }
        return item;
      })
    );
  };

  // 일괄 피킹 완료
  const handleBatchPickAll = () => {
    setItems((prev) =>
      prev.map((item) => ({ ...item, pickedQuantity: item.quantity }))
    );
    toast.success('모든 품목의 피킹 수량이 출고 요청 수량으로 설정되었습니다.');
  };

  // 출고 확정 처리 (완료 & 재고 차감)
  const handleComplete = async () => {
    if (!outbound) return;

    // 미완료 품목 체크
    const unpickedCount = items.filter((i) => (i.pickedQuantity || 0) < i.quantity).length;
    let confirmMsg = `출고지시 [${outbound.outboundNo}] 건을 최종 출고 확정하시겠습니까?\n확정 시 수량만큼 해당 로케이션의 재고가 자동 차감됩니다.`;
    if (unpickedCount > 0) {
      confirmMsg = `아직 피킹이 완료되지 않은 품목이 ${unpickedCount}개 있습니다.\n이대로 출고 확정(재고 차감)을 진행하시겠습니까?`;
    }

    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      await completeOutboundApi(outbound.id, { description: '출고 상세 화면에서 현장 피킹 완료 및 확정 처리' });
      toast.success('출고 확정이 성공적으로 처리되었습니다. (재고 자동 차감 완료)');
      fetchDetail();
    } catch (err: any) {
      const msg = err?.message || '출고 확정 처리 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 출고 취소 처리
  const handleCancel = async () => {
    if (!outbound) return;

    if (!window.confirm(`출고지시 [${outbound.outboundNo}] 건을 취소하시겠습니까?`)) {
      return;
    }

    setSubmitting(true);
    try {
      await cancelOutboundApi(outbound.id);
      toast.success('출고지시가 취소되었습니다.');
      fetchDetail();
    } catch (err: any) {
      const msg = err?.message || '출고지시 취소 중 오류가 발생했습니다.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 전체 피킹 상태 계산
  const getOverallPickingStatus = (): OutboundStatus => {
    if (!outbound) return 'REQUESTED';
    if (outbound.status === 'COMPLETED') return 'COMPLETED';
    if (outbound.status === 'CANCELED') return 'CANCELED';

    const totalPicked = items.reduce((acc, curr) => acc + (curr.pickedQuantity || 0), 0);
    const totalRequested = items.reduce((acc, curr) => acc + curr.quantity, 0);

    if (totalPicked > 0 && totalPicked < totalRequested) {
      return 'PICKING';
    }
    if (totalPicked >= totalRequested && totalRequested > 0) {
      return 'PICKING'; // 피킹 완료되었으나 아직 최종 출고 확정 전
    }
    return 'REQUESTED';
  };

  const currentComputedStatus = getOverallPickingStatus();

  // 상태 Badge 렌더러
  const renderStatusBadge = (status?: OutboundStatus) => {
    const displayStatus = status === 'REQUESTED' ? currentComputedStatus : status;

    switch (displayStatus) {
      case 'REQUESTED':
        return (
          <span
            style={{
              padding: '0.35rem 0.85rem',
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
            <Clock size={14} /> 출고요청
          </span>
        );
      case 'PICKING':
        return (
          <span
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Layers size={14} /> 피킹중
          </span>
        );
      case 'COMPLETED':
        return (
          <span
            style={{
              padding: '0.35rem 0.85rem',
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
            <CheckCircle2 size={14} /> 출고완료
          </span>
        );
      case 'CANCELED':
        return (
          <span
            style={{
              padding: '0.35rem 0.85rem',
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
            <XCircle size={14} /> 출고취소
          </span>
        );
      default:
        return null;
    }
  };

  // Stepper 활성 단계 계산
  const getStepStatus = () => {
    if (!outbound) return 1;
    if (outbound.status === 'COMPLETED') return 3;
    if (outbound.status === 'CANCELED') return -1;
    if (currentComputedStatus === 'PICKING') return 2;
    return 1;
  };

  const activeStep = getStepStatus();

  // 품목별 피킹 개별 상태 Badge
  const renderItemPickingBadge = (item: OutboundItemResponse) => {
    const picked = item.pickedQuantity || 0;
    const req = item.quantity;

    if (picked >= req) {
      return (
        <span style={{
          padding: '0.2rem 0.6rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 700,
          background: 'rgba(34, 197, 94, 0.15)',
          color: '#4ade80',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <Check size={12} /> 피킹 완료
        </span>
      );
    }
    if (picked > 0) {
      return (
        <span style={{
          padding: '0.2rem 0.6rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 700,
          background: 'rgba(56, 189, 248, 0.15)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.3)',
        }}>
          진행중 ({picked}/{req})
        </span>
      );
    }
    return (
      <span style={{
        padding: '0.2rem 0.6rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: '#334155',
        color: '#94a3b8',
      }}>
        대기
      </span>
    );
  };

  // 피킹 품목 컬럼 정의 (사용자 요청 형태 정확히 구성!)
  const itemColumns: Column<OutboundItemResponse>[] = [
    {
      key: 'itemId',
      header: 'NO',
      width: '60px',
      align: 'center',
      render: (_, index) => index + 1,
    },
    {
      key: 'itemCode',
      header: '품목 (코드/명)',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#38bdf8' }}>{row.itemCode}</div>
          <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{row.itemName}</div>
        </div>
      ),
    },
    {
      key: 'locationCode',
      header: '피킹 로케이션',
      width: '180px',
      render: (row) => (
        <div>
          <span style={{ padding: '0.15rem 0.45rem', background: '#334155', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#93c5fd' }}>
            {row.locationCode || '-'}
          </span>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            {row.locationName || '-'}
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: '요청 수량',
      width: '110px',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
          {Number(row.quantity).toLocaleString()} 개
        </span>
      ),
    },
    {
      key: 'pickedQuantity',
      header: '피킹 수량',
      width: '160px',
      align: 'center',
      render: (row) => {
        const isEditable = outbound?.status !== 'COMPLETED' && outbound?.status !== 'CANCELED';
        const currentPicked = row.pickedQuantity || 0;

        return isEditable ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => handlePickedQtyChange(row.itemId, currentPicked - 1)}
              style={{
                width: '26px',
                height: '26px',
                background: '#334155',
                border: '1px solid #475569',
                borderRadius: '4px',
                color: '#f8fafc',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              -
            </button>
            <input
              type="number"
              min="0"
              max={row.quantity}
              value={currentPicked}
              onChange={(e) => handlePickedQtyChange(row.itemId, Number(e.target.value))}
              style={{
                width: '60px',
                textAlign: 'center',
                background: '#0f172a',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                color: '#4ade80',
                fontWeight: 700,
                padding: '0.2rem',
              }}
            />
            <button
              type="button"
              onClick={() => handlePickedQtyChange(row.itemId, currentPicked + 1)}
              style={{
                width: '26px',
                height: '26px',
                background: '#334155',
                border: '1px solid #475569',
                borderRadius: '4px',
                color: '#f8fafc',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              +
            </button>
          </div>
        ) : (
          <span style={{ fontWeight: 700, color: '#4ade80', fontSize: '0.95rem' }}>
            {currentPicked} 개
          </span>
        );
      },
    },
    {
      key: 'pickingStatus',
      header: '피킹 상태',
      width: '130px',
      align: 'center',
      render: (row) => renderItemPickingBadge(row),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title={`출고 상세 및 피킹 작업 [${outbound?.outboundNo || '조회중'}]`}
        description="출고지시 품목별 현장 피킹 수량을 확인/입력하고 최종 출고 확정(재고 자동 차감)을 진행합니다."
        icon={<Truck size={24} />}
        extra={
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/outbound/list')}
          >
            <ArrowLeft size={16} />
            목록으로
          </button>
        }
      />

      {loading ? (
        <div className={styles.fullPageLoading}>
          <div className={styles.spinner} />
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>출고 상세 및 피킹 정보를 불러오는 중입니다...</p>
        </div>
      ) : (
        <>
          {/* 워크플로우 진행 상태 Stepper (출고요청 -> 피킹중 -> 출고완료) */}
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
              출고 & 피킹 프로세스 진행 현황
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              {/* Step 1: 출고 요청 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: activeStep >= 1 ? '#eab308' : '#64748b' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: activeStep >= 1 ? 'rgba(234, 179, 8, 0.2)' : '#334155',
                  border: `2px solid ${activeStep >= 1 ? '#eab308' : '#475569'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}>
                  1
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>출고 요청</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>지시서 생성 완료</div>
                </div>
              </div>

              <div style={{ height: '2px', flex: 1, minWidth: '40px', background: activeStep >= 2 ? '#38bdf8' : '#334155' }} />

              {/* Step 2: 피킹중 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: activeStep >= 2 ? '#38bdf8' : '#64748b' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: activeStep >= 2 ? 'rgba(56, 189, 248, 0.2)' : '#334155',
                  border: `2px solid ${activeStep >= 2 ? '#38bdf8' : '#475569'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}>
                  <Layers size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>피킹중 (Picking)</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>현장 수량 조절/검수중</div>
                </div>
              </div>

              <div style={{ height: '2px', flex: 1, minWidth: '40px', background: activeStep >= 3 ? '#22c55e' : '#334155' }} />

              {/* Step 3: 출고 완료 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: activeStep >= 3 ? '#22c55e' : '#64748b' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: activeStep >= 3 ? 'rgba(34, 197, 94, 0.2)' : '#334155',
                  border: `2px solid ${activeStep >= 3 ? '#22c55e' : '#475569'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>출고 완료 (재고 차감)</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>최종 확정 완료</div>
                </div>
              </div>
            </div>
          </div>

          {/* 출고 기본정보 카드 */}
          <div className={styles.filterSection} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} style={{ color: '#3b82f6' }} />
                출고 기본정보
              </h3>
              <div>{renderStatusBadge(outbound?.status)}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', paddingTop: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>출고 번호</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>{outbound?.outboundNo || '-'}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>고객사 (Customer)</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                  {outbound?.customerName ? `${outbound.customerName} ${outbound.customerCode ? `(${outbound.customerCode})` : ''}` : '-'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>배송지 위치명</span>
                <span style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>
                  {outbound?.deliveryAddressName || '기본 배송지'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>출고 완료 일시</span>
                <span style={{ fontSize: '0.95rem', color: outbound?.completedAt ? '#4ade80' : '#64748b' }}>
                  {outbound?.completedAt ? String(outbound.completedAt).replace('T', ' ').substring(0, 19) : '미완료 (피킹 진행중)'}
                </span>
              </div>
            </div>
          </div>

          {/* 출고 품목 피킹 상태 테이블 카드 */}
          <div className={styles.filterSection} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} style={{ color: '#38bdf8' }} />
                출고 품목 피킹 현황 목록
              </h3>

              {outbound?.status !== 'COMPLETED' && outbound?.status !== 'CANCELED' && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleBatchPickAll}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                >
                  <Check size={14} /> 모든 품목 피킹 완료 설정
                </button>
              )}
            </div>

            <DataGrid
              columns={itemColumns}
              data={items}
              keyExtractor={(item) => item.itemId}
              loading={loading}
              emptyText="출고 품목 데이터가 없습니다."
            />
          </div>

          {/* 피킹 제어 및 출고 확정 액션 바 */}
          {outbound?.status !== 'COMPLETED' && outbound?.status !== 'CANCELED' && (
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
                  현장 피킹 검수 및 출고 확정 처리
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  '출고 확정' 클릭 시 피킹된 품목 수량이 지정된 각 로케이션 재고에서 즉시 차감됩니다.
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
                  출고 지시 취소
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleComplete}
                  disabled={submitting}
                  style={{ background: '#3b82f6', padding: '0.6rem 1.25rem', fontSize: '0.95rem' }}
                >
                  <CheckSquare size={18} />
                  {submitting ? '처리 중...' : '출고 확정 (재고 차감)'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
