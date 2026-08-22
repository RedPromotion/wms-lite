import React from 'react';
import {
  Package,
  Truck,
  ArrowRightLeft,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
  FileText,
  MapPin,
  Building2,
} from 'lucide-react';
import { Modal } from './Modal';

export type HistoryType = 'INBOUND' | 'OUTBOUND' | 'MOVEMENT' | 'ADJUSTMENT';

export interface StockHistoryDetailItem {
  id: number;
  itemCode: string;
  itemName: string;
  locationCode: string;
  historyType: HistoryType;
  beforeQuantity: number;
  changeQuantity: number;
  afterQuantity: number;
  referenceNo?: string;
  createdAt: string;
  warehouseName?: string;
  description?: string;
  sourceLocation?: string;
  targetLocation?: string;
  partnerName?: string;
  deliveryAddress?: string;
}

interface StockHistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyItem: StockHistoryDetailItem | null;
}

export const StockHistoryDetailModal: React.FC<StockHistoryDetailModalProps> = ({
  isOpen,
  onClose,
  historyItem,
}) => {
  if (!historyItem) return null;

  const {
    id,
    itemCode,
    itemName,
    locationCode,
    historyType,
    beforeQuantity,
    changeQuantity,
    afterQuantity,
    referenceNo,
    createdAt,
    warehouseName = '메인 중앙 물류창고',
    description,
    sourceLocation,
    targetLocation,
    partnerName,
  } = historyItem;

  // 수불 구분별 테마 및 바인딩 데이터 설정
  const getHistoryConfig = () => {
    switch (historyType) {
      case 'INBOUND':
        return {
          title: '입고 수불 이력 상세 (Stock Inbound)',
          badgeText: '입고 수불 (INBOUND)',
          icon: <Package size={22} style={{ color: '#10b981' }} />,
          color: '#10b981',
          bgAlpha: 'rgba(16, 185, 129, 0.12)',
          borderAlpha: 'rgba(16, 185, 129, 0.3)',
          changeLabel: '입고 수량 (+)',
          actionDesc: '외부 공급업체로부터 자재/상품이 창고로 입고되어 재고가 전산 증가했습니다.',
          refLabel: '입고 지시 번호',
          originLabel: '준 곳 (출발 공급처)',
          originValue: partnerName || sourceLocation || '외부 공급업체 (DB 연동)',
          destLabel: '받은 곳 (입고 창고 & 로케이션)',
          destValue: targetLocation || `${warehouseName} [${locationCode}]`,
        };
      case 'OUTBOUND':
        return {
          title: '출고 수불 이력 상세 (Stock Outbound)',
          badgeText: '출고 수불 (OUTBOUND)',
          icon: <Truck size={22} style={{ color: '#3b82f6' }} />,
          color: '#3b82f6',
          bgAlpha: 'rgba(59, 130, 246, 0.12)',
          borderAlpha: 'rgba(59, 130, 246, 0.3)',
          changeLabel: '출고 수량 (-)',
          actionDesc: '고객사 요청에 따라 지정 로케이션에서 피킹 출고되어 지정 기업/배송지로 납품되었습니다.',
          refLabel: '출고 지시 번호',
          originLabel: '준 곳 (출고 보관창고 & 피킹 로케이션)',
          originValue: sourceLocation || `${warehouseName} [${locationCode}]`,
          destLabel: '받은 곳 (납품 대상 기업 & 배송지)',
          destValue: targetLocation || (partnerName ? `${partnerName} 지정 배송지` : '고객사 배송지 (DB 참조)'),
        };
      case 'MOVEMENT':
        return {
          title: '로케이션 이동 수불 이력 상세 (Stock Movement)',
          badgeText: '이동 수불 (MOVEMENT)',
          icon: <ArrowRightLeft size={22} style={{ color: '#a855f7' }} />,
          color: '#a855f7',
          bgAlpha: 'rgba(168, 85, 247, 0.12)',
          borderAlpha: 'rgba(168, 85, 247, 0.3)',
          changeLabel: '이동 수량',
          actionDesc: '창고 내부 효율성 향상을 위해 지정 로케이션 간 재고 위치 이동이 전산 반영되었습니다.',
          refLabel: '재고 이동 번호',
          originLabel: '준 곳 (출발 로케이션)',
          originValue: sourceLocation || `${locationCode}`,
          destLabel: '받은 곳 (도착 목적지 로케이션)',
          destValue: targetLocation || '도착 지정 로케이션',
        };
      case 'ADJUSTMENT':
      default:
        return {
          title: '재고 손익/실사 조정 수불 상세 (Stock Adjustment)',
          badgeText: '손익 실사 (ADJUSTMENT)',
          icon: <Sliders size={22} style={{ color: '#f59e0b' }} />,
          color: '#f59e0b',
          bgAlpha: 'rgba(245, 158, 11, 0.12)',
          borderAlpha: 'rgba(245, 158, 11, 0.3)',
          changeLabel: '손익 조정 수량',
          actionDesc: '현장 실사 차이, 분실 또는 파손 등에 따라 전산 재고 수량이 수동 조정되었습니다.',
          refLabel: '실사 조정 번호',
          originLabel: '조정 발생 로케이션',
          originValue: sourceLocation || `${warehouseName} [${locationCode}]`,
          destLabel: '조정 결과 처리',
          destValue: targetLocation || '전산 실재고 반영',
        };
    }
  };

  const config = getHistoryConfig();
  const isPositive = changeQuantity > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {config.icon}
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{config.title}</span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', color: '#e2e8f0' }}>
        {/* 수불 구분 상단 배지 헤더 */}
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: config.bgAlpha,
            border: `1px solid ${config.borderAlpha}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.85rem',
                color: config.color,
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
              }}
            >
              {config.badgeText}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 500 }}>
              수불 이력 ID: #{id}
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={13} />
            {createdAt}
          </div>
        </div>

        {/* 🚚 핵심: 어느 창고에서 어느 기업으로 납품되었는지 물류 이동 및 납품 경로 카드 */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: `1px solid ${config.borderAlpha}`,
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <h4
            style={{
              margin: '0 0 0.8rem 0',
              fontSize: '0.875rem',
              color: '#94a3b8',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Truck size={16} style={{ color: config.color }} />
            물류 이동 및 납품 경로 (창고/장소 → 기업/배송지)
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            {/* 준 곳 (Origin) */}
            <div
              style={{
                background: '#1e293b',
                padding: '0.85rem 1rem',
                borderRadius: '6px',
                border: '1px solid #334155',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600 }}>
                <MapPin size={13} style={{ color: '#f59e0b' }} /> {config.originLabel}
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', wordBreak: 'break-all', display: 'block' }}>
                {config.originValue}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowRight size={22} style={{ color: config.color }} />
              <span style={{ fontSize: '0.725rem', color: config.color, fontWeight: 700 }}>
                {historyType}
              </span>
            </div>

            {/* 받은 곳 (Destination) */}
            <div
              style={{
                background: '#1e293b',
                padding: '0.85rem 1rem',
                borderRadius: '6px',
                border: '1px solid #334155',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600 }}>
                <Building2 size={13} style={{ color: '#38bdf8' }} /> {config.destLabel}
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', wordBreak: 'break-all', display: 'block' }}>
                {config.destValue}
              </span>
            </div>
          </div>
        </div>

        {/* 품목 및 로케이션 기본 명세 카드 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            background: '#0f172a',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
              대상 품목 (Item)
            </span>
            <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
              {itemName}
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#60a5fa', marginTop: '0.1rem' }}>
              [{itemCode}]
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
              보관 창고 및 로케이션
            </span>
            <span style={{ fontWeight: 600, color: '#34d399', fontSize: '0.95rem' }}>
              {locationCode}
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.1rem' }}>
              🏢 {warehouseName}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
              {config.refLabel}
            </span>
            <span style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.9rem', fontFamily: 'monospace' }}>
              {referenceNo || `TRX-${id}`}
            </span>
          </div>
        </div>

        {/* ⚡ 재고 수량 변동 타임라인 흐름 카드 */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <h4
            style={{
              margin: '0 0 0.85rem 0',
              fontSize: '0.875rem',
              color: '#94a3b8',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Layers size={14} /> 재고 수량 변동 흐름 (Quantity Flow)
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr auto 1fr',
              alignItems: 'center',
              gap: '0.5rem',
              textAlign: 'center',
            }}
          >
            {/* 변동 전 */}
            <div style={{ background: '#0f172a', padding: '0.75rem 0.5rem', borderRadius: '6px', border: '1px solid #334155' }}>
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                변동 전 재고 (Before)
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#94a3b8' }}>
                {beforeQuantity.toLocaleString()} EA
              </span>
            </div>

            <ArrowRight size={18} style={{ color: '#64748b' }} />

            {/* 변동 증감 */}
            <div
              style={{
                background: config.bgAlpha,
                border: `1px solid ${config.borderAlpha}`,
                padding: '0.75rem 0.5rem',
                borderRadius: '6px',
              }}
            >
              <span style={{ display: 'block', fontSize: '0.72rem', color: config.color, marginBottom: '0.2rem', fontWeight: 600 }}>
                {config.changeLabel}
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: config.color }}>
                {isPositive ? `+${changeQuantity.toLocaleString()}` : changeQuantity.toLocaleString()} EA
              </span>
            </div>

            <ArrowRight size={18} style={{ color: '#64748b' }} />

            {/* 변동 후 */}
            <div style={{ background: '#0f172a', padding: '0.75rem 0.5rem', borderRadius: '6px', border: '1px solid #22c55e' }}>
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#4ade80', marginBottom: '0.2rem', fontWeight: 600 }}>
                최종 반영 재고 (After)
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#4ade80' }}>
                {afterQuantity.toLocaleString()} EA
              </span>
            </div>
          </div>
        </div>

        {/* 수불 상세 비고 & 설명 */}
        <div
          style={{
            fontSize: '0.825rem',
            color: '#cbd5e1',
            background: 'rgba(15, 23, 42, 0.5)',
            padding: '0.75rem 0.85rem',
            borderRadius: '6px',
            border: '1px solid rgba(51, 65, 85, 0.7)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
          }}
        >
          <FileText size={16} style={{ color: config.color, flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.2rem' }}>
              수불 변동 사유 및 처리 내용
            </div>
            <div>{description || config.actionDesc}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            className={Modal.styles.cancelBtn}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
};
