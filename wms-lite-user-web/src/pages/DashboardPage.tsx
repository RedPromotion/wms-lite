import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import {
  LayoutDashboard,
  Boxes,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Activity,
  History,
  TrendingUp,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { StatCardGrid } from '../components/StatCardGrid';
import { DataGrid, type Column } from '../components/DataGrid';
import styles from './DashboardPage.module.css';
import { getDashboardSummary } from '../features/dashboard/api/dashboardApi';
import type { DashboardSummary, RecentTransaction } from '../features/dashboard/types/dashboardTypes';

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard summary:', err);
      setError('대시보드 데이터를 불러오지 못했습니다. 백엔드 서버 상태를 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-';
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1];
      return timePart.substring(0, 8);
    }
    return timeStr;
  };

  // 최근 입출고 DataGrid 컬럼 정의
  const columns: Column<RecentTransaction>[] = [
    {
      key: 'time',
      header: '발생 시각',
      render: (t) => (
        <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>
          {formatTime(t.time)}
        </span>
      ),
    },
    {
      key: 'type',
      header: '수불 구분',
      render: (t) => {
        let color = '#60a5fa';
        let bg = 'rgba(59, 130, 246, 0.15)';
        if (t.type === 'INBOUND') { color = '#4ade80'; bg = 'rgba(34, 197, 94, 0.15)'; }
        if (t.type === 'OUTBOUND') { color = '#fb923c'; bg = 'rgba(249, 115, 22, 0.15)'; }
        if (t.type === 'ADJUSTMENT') { color = '#c084fc'; bg = 'rgba(168, 85, 247, 0.15)'; }

        return (
          <span
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              background: bg,
              color: color,
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            {t.typeLabel || t.type}
          </span>
        );
      },
    },
    {
      key: 'itemCode',
      header: '품목 코드',
      render: (t) => <span style={{ fontWeight: 600, color: '#60a5fa' }}>{t.itemCode || '-'}</span>,
    },
    {
      key: 'itemName',
      header: '품목명',
      render: (t) => <span style={{ fontWeight: 500 }}>{t.itemName || '-'}</span>,
    },
    {
      key: 'locationCode',
      header: '보관/이동 로케이션',
      render: (t) => <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{t.locationCode || '-'}</span>,
    },
    {
      key: 'quantity',
      header: '증감 수량',
      align: 'right',
      render: (t) => {
        const isPlus = t.quantity > 0;
        return (
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: isPlus ? '#4ade80' : '#f87171',
            }}
          >
            {isPlus ? `+${t.quantity.toLocaleString()}` : t.quantity.toLocaleString()} EA
          </span>
        );
      },
    },
    {
      key: 'status',
      header: '상태',
      align: 'center',
      render: (t) => (
        <span
          style={{
            fontSize: '0.78rem',
            color: t.status === '완료' ? '#4ade80' : t.status === '진행중' ? '#60a5fa' : '#facc15',
          }}
        >
          {t.status || '완료'}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* 상단 헤더 패널 */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>
            <LayoutDashboard size={24} style={{ color: '#3b82f6' }} />
            WMS 실시간 관제 대시보드 (Operation Monitoring)
          </h2>
          <p className={styles.subtitle}>
            {user?.name || user?.loginId || '현장 작업자'}님, 오늘 물류 센터의 실시간 재고, 입/출고 실적 및 작업 대기 현황입니다.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchDashboard}
            style={{
              background: '#334155',
              border: '1px solid #475569',
              color: '#f8fafc',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
            }}
            title="대시보드 새로고침"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
          <div className={styles.statusBadge}>
            <Activity size={14} />
            시스템 실시간 정상가동 중
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {/* 1단: 주요 지표 요약 카드 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <TrendingUp size={18} style={{ color: '#60a5fa' }} />
            주요 물류 운영 현황 지표
          </h3>
        </div>

        <StatCardGrid columns="auto" minChildWidth="210px">
          <StatCard
            icon={<Boxes size={16} />}
            title="총 재고"
            value={summary ? summary.totalInventoryQuantity : 0}
            unit="EA"
            subText="전체 보관 재고 수량"
            variant="info"
          />
          <StatCard
            icon={<Package size={16} />}
            title="전체 품목"
            value={summary ? summary.totalItemSkuCount : 0}
            unit="SKU"
            subText="마스터 등록 품목 수"
            variant="purple"
          />
          <StatCard
            icon={<ArrowDownLeft size={16} />}
            title="오늘 입고"
            value={summary ? summary.todayInboundCount : 0}
            unit="건"
            subText={`입고 완료 (합계 +${(summary?.todayInboundQuantity || 0).toLocaleString()} EA)`}
            variant="success"
          />
          <StatCard
            icon={<ArrowUpRight size={16} />}
            title="오늘 출고"
            value={summary ? summary.todayOutboundCount : 0}
            unit="건"
            subText={`출고 완료 (합계 -${(summary?.todayOutboundQuantity || 0).toLocaleString()} EA)`}
            variant="warning"
          />
          <StatCard
            icon={<Clock size={16} />}
            title="입고 대기"
            value={summary ? summary.pendingInboundCount : 0}
            unit="건"
            subText="입고 검수 대기 중"
            variant="info"
          />
          <StatCard
            icon={<FileCheck size={16} />}
            title="출고 대기"
            value={summary ? summary.pendingOutboundCount : 0}
            unit="건"
            subText="피킹/패킹 지시 대기 중"
            variant="warning"
          />
        </StatCardGrid>
      </div>

      {/* 2단: 최근 입출고 현황 (단일 카드 패널로 전체 가로 폭 활용) */}
      <div className={styles.cardPanel}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <History size={18} style={{ color: '#60a5fa' }} />
            최근 입출고 및 수불 실적 (Recent Transactions)
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>실시간 수불 기록</span>
        </div>

        <DataGrid<RecentTransaction>
          columns={columns}
          data={summary?.recentTransactions || []}
          keyExtractor={(t) => t.id}
          loading={loading}
          emptyText="최근 발생한 수불 이력 내역이 없습니다."
        />
      </div>
    </div>
  );
};
