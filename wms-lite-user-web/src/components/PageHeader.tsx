import React from 'react';
import { Database, Zap, RefreshCw } from 'lucide-react';
import styles from './PageHeader.module.css';

/**
 * 1. 페이지 상단 타이틀 헤더 컴포넌트
 */
export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  extra,
}) => {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleWrapper}>
        <h2 className={styles.pageTitle}>
          {icon}
          {title}
        </h2>
        {description && <p className={styles.pageSubtitle}>{description}</p>}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
};

/**
 * 2. 1단 라인: 🔍 검색 & 필터 조작 전용 툴바 (PageToolbar)
 */
export interface PageToolbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const PageToolbar: React.FC<PageToolbarProps> = ({ left, right }) => {
  return (
    <div className={styles.toolbar}>
      {left && <div className={styles.toolbarLeft}>{left}</div>}
      {right && <div className={styles.toolbarRight}>{right}</div>}
    </div>
  );
};

/**
 * 3. 2단 라인: ⚡ 데이터 조작 & 액션 버튼 전용 툴바 (PageActionBar) - [신설]
 */
export interface PageActionBarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const PageActionBar: React.FC<PageActionBarProps> = ({ left, right }) => {
  return (
    <div className={styles.actionBar}>
      {left && <div className={styles.actionBarLeft}>{left}</div>}
      {right && <div className={styles.actionBarRight}>{right}</div>}
    </div>
  );
};

/**
 * 4-A. [DB 전체 조회 건수 뱃지]
 */
export interface ServerCountBadgeProps {
  totalCount: number;
  serverSearchKeyword?: string;
}

export const ServerCountBadge: React.FC<ServerCountBadgeProps> = ({
  totalCount,
  serverSearchKeyword,
}) => {
  const isServerFiltered = Boolean(serverSearchKeyword && serverSearchKeyword.trim() !== '');

  return (
    <span className={`${styles.statusBadge} ${isServerFiltered ? styles.badgeActiveServer : styles.badgeNormal}`}>
      <Database size={13} />
      {isServerFiltered ? (
        <>
          DB 전체 검색: <strong className={styles.highlightText}>'{serverSearchKeyword}'</strong> ({totalCount}건)
        </>
      ) : (
        <>
          DB 전체: <strong>{totalCount}건</strong>
        </>
      )}
    </span>
  );
};

/**
 * 4-B. [결과 내 필터 건수 뱃지]
 */
export interface QuickFilterBadgeProps {
  filteredCount: number;
  quickFilterKeyword?: string;
  onReset?: () => void;
}

export const QuickFilterBadge: React.FC<QuickFilterBadgeProps> = ({
  filteredCount,
  quickFilterKeyword,
  onReset,
}) => {
  const isQuickFiltered = Boolean(quickFilterKeyword && quickFilterKeyword.trim() !== '');

  if (!isQuickFiltered) return null;

  return (
    <div className={styles.badgeGroup}>
      <span className={`${styles.statusBadge} ${styles.badgeActiveQuick}`}>
        <Zap size={13} />
        필터 결과: <strong className={styles.highlightText}>'{quickFilterKeyword}'</strong> ({filteredCount}건 표시)
      </span>
      {onReset && (
        <button className={styles.resetBtn} onClick={onReset} title="필터 초기화">
          <RefreshCw size={11} />
          초기화
        </button>
      )}
    </div>
  );
};

/**
 * 하위 호환성을 위한 통합 FilterStatusBadge
 */
export interface FilterStatusBadgeProps {
  totalCount: number;
  filteredCount: number;
  serverSearchKeyword?: string;
  quickFilterKeyword?: string;
  onResetAll?: () => void;
}

export const FilterStatusBadge: React.FC<FilterStatusBadgeProps> = ({
  totalCount,
  filteredCount,
  serverSearchKeyword,
  quickFilterKeyword,
  onResetAll,
}) => {
  return (
    <div className={styles.badgeWrapper}>
      <ServerCountBadge totalCount={totalCount} serverSearchKeyword={serverSearchKeyword} />
      <QuickFilterBadge filteredCount={filteredCount} quickFilterKeyword={quickFilterKeyword} onReset={onResetAll} />
    </div>
  );
};
