import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToExcel } from '../utils/excelUtils';
import styles from './ExcelDownloadButton.module.css';

export interface ExcelDownloadButtonProps<T = Record<string, unknown>> {
  /** 엑셀로 추출할 데이터 배열 */
  data: T[];
  /** 저장할 파일명 (확장자 없이 작성해도 자동 생성) */
  fileName?: string;
  /** 시트 명 (기본값: 'Sheet1') */
  sheetName?: string;
  /** 영문 컬럼 ↔ 한글 헤더 매핑 */
  headerMap?: Record<string, string>;
  /** 내보내기에서 제외할 키 목록 */
  excludeKeys?: string[];
  /** 버튼 텍스트 (기본값: '엑셀 다운로드') */
  label?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 커스텀 클래스 */
  className?: string;
}

export const ExcelDownloadButton = <T extends Record<string, unknown>>({
  data,
  fileName = 'WMS_Export_Data',
  sheetName = 'Sheet1',
  headerMap,
  excludeKeys = [],
  label = '엑셀 다운로드',
  disabled = false,
  className = '',
}: ExcelDownloadButtonProps<T>) => {
  const handleExport = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!data || data.length === 0) {
      toast.error('다운로드할 데이터가 없습니다.');
      return;
    }

    try {
      exportToExcel({
        data,
        fileName,
        sheetName,
        headerMap,
        excludeKeys,
      });
      toast.success('Excel 호환 CSV 파일이 성공적으로 다운로드되었습니다.');
    } catch (error) {
      console.error('[ExcelDownloadError]', error);
      toast.error('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  const isBtnDisabled = disabled || !data || data.length === 0;

  return (
    <button
      type="button"
      className={`${styles.excelBtn} ${className}`.trim()}
      onClick={handleExport}
      disabled={isBtnDisabled}
      title={isBtnDisabled ? '다운로드할 데이터가 없습니다.' : 'Excel 호환 CSV로 내보내기'}
    >
      <span className={styles.icon}>
        <FileSpreadsheet size={16} />
      </span>
      <span>{label}</span>
    </button>
  );
};
