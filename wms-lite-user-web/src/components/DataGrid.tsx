import React from 'react';
import { ChevronLeft, ChevronRight, TableProperties } from 'lucide-react';
import { ExcelDownloadButton } from './ExcelDownloadButton';
import styles from './DataGrid.module.css';

/**
 * DataGrid 컬럼 정의 인터페이스
 */
export interface Column<T> {
  key: string;
  header: React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
}

/**
 * 페이징 정보 인터페이스
 */
export interface PaginationProps {
  totalElements: number;
  page: number;
  size: number;
  onPageChange?: (newPage: number) => void;
}

/**
 * DataGrid 컴포넌트 Props 인터페이스 (제네릭 T)
 */
export interface DataGridProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  selectable?: boolean;
  selectedKeys?: (string | number)[];
  onSelectionChange?: (keys: (string | number)[]) => void;
  pagination?: PaginationProps;
  emptyText?: string;
  loading?: boolean;

  /** 그리드 상단 제목 (문자열 입력 시 자동 래핑 아이콘 스타일 적용) */
  title?: React.ReactNode;
  /** 그리드 타이틀 커스텀 아이콘 */
  titleIcon?: React.ReactNode;
  /** 그리드 상단 우측에 엑셀 다운로드 버튼 자동 추가 여부 (기본값: false) */
  enableExcelExport?: boolean;
  /** 엑셀 내보내기 파일명 (기본값: 'Data_Export') */
  excelFileName?: string;
  /** 엑셀 한글 헤더 매핑 (기본값: columns 정보를 이용해 자동 생성) */
  excelHeaderMap?: Record<string, string>;
  /** 엑셀 내보내기 제외 필드 키 */
  excelExcludeKeys?: string[];
  /** 그리드 상단 우측 커스텀 툴바 액션 버튼 (선택 사항) */
  toolbarActions?: React.ReactNode;
}

export function DataGrid<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  pagination,
  emptyText = '조회된 데이터가 없습니다.',
  loading = false,
  title,
  titleIcon,
  enableExcelExport = false,
  excelFileName = 'Data_Export',
  excelHeaderMap,
  excelExcludeKeys = [],
  toolbarActions,
}: DataGridProps<T>) {
  // 전체 선택 체크박스 변경
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const allKeys = data.map((item) => keyExtractor(item));
      onSelectionChange(allKeys);
    } else {
      onSelectionChange([]);
    }
  };

  // 행 단건 선택 체크박스 변경
  const handleSelectRow = (key: string | number) => {
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  const isAllSelected = data.length > 0 && selectedKeys.length === data.length;

  // excelHeaderMap이 별도로 전달되지 않았을 경우, columnsProp의 header와 key 정보를 토대로 자동 헤더 맵 구성
  const computedHeaderMap = React.useMemo(() => {
    if (excelHeaderMap) return excelHeaderMap;

    const autoMap: Record<string, string> = {};
    columns.forEach((col) => {
      if (typeof col.header === 'string') {
        autoMap[col.key] = col.header;
      }
    });
    return autoMap;
  }, [columns, excelHeaderMap]);

  const hasHeaderBar = Boolean(title || enableExcelExport || toolbarActions);

  const getCellValue = (row: T, key: string): string => {
    const value = row[key];
    return value != null ? String(value) : '-';
  };

  const renderedTitle = React.useMemo(() => {
    if (!title) return null;
    if (typeof title === 'string') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.925rem', fontWeight: 600, color: '#f8fafc' }}>
          {titleIcon || <TableProperties size={17} style={{ color: '#3b82f6' }} />}
          {title}
        </span>
      );
    }
    return title;
  }, [title, titleIcon]);

  return (
    <div className={styles.gridCard}>
      {/* 0. 그리드 상단 Header / Toolbar 영역 */}
      {hasHeaderBar && (
        <div className={styles.gridHeader}>
          <div className={styles.gridTitle}>{renderedTitle}</div>
          <div className={styles.gridActions}>
            {toolbarActions}
            {enableExcelExport && (
              <ExcelDownloadButton
                data={data}
                fileName={excelFileName}
                headerMap={computedHeaderMap}
                excludeKeys={excelExcludeKeys}
              />
            )}
          </div>
        </div>
      )}

      {/* 1. 로딩 중 뷰 */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <span>백엔드 API 서버에서 데이터를 조회하는 중입니다...</span>
        </div>
      ) : (
        /* 2. 정상 데이터 테이블 뷰 */
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {selectable && (
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        width: col.width,
                        textAlign: col.align || 'left',
                      }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (selectable ? 1 : 0)}
                      className={styles.emptyRow}
                    >
                      {emptyText}
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => {
                    const rowKey = keyExtractor(row);
                    const isSelected = selectedKeys.includes(rowKey);
                    return (
                      <tr
                        key={rowKey}
                        className={isSelected ? styles.selectedRow : ''}
                      >
                        {selectable && (
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(rowKey)}
                            />
                          </td>
                        )}
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            style={{ textAlign: col.align || 'left' }}
                          >
                            {col.render ? col.render(row, index) : getCellValue(row, col.key)}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 페이징 영역 */}
          {pagination && (
            <div className={styles.pagination}>
              <div className={styles.pageInfo}>
                총 <strong>{pagination.totalElements}</strong>개 중{' '}
                <strong>
                  {pagination.totalElements === 0
                    ? 0
                    : (pagination.page - 1) * pagination.size + 1}
                  -
                  {Math.min(
                    pagination.page * pagination.size,
                    pagination.totalElements
                  )}
                </strong>{' '}
                표시
              </div>
              <div className={styles.pageControls}>
                <button
                  className={styles.pageBtn}
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    pagination.onPageChange?.(Math.max(1, pagination.page - 1))
                  }
                >
                  <ChevronLeft size={16} />
                </button>
                <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>
                  {pagination.page}
                </button>
                <button
                  className={styles.pageBtn}
                  disabled={
                    pagination.page * pagination.size >= pagination.totalElements
                  }
                  onClick={() => pagination.onPageChange?.(pagination.page + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
