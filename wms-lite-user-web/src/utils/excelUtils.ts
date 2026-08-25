export interface ExcelExportOptions<T = Record<string, unknown>> {
  data: T[];
  fileName: string;
  sheetName?: string;// CSV export keeps this for API compatibility.
  headerMap?: Record<string, string>;
  excludeKeys?: string[];// 엑셀 출력에서 제외할 필드키 목록 (선택 사항)
}

/**
 * JSON 데이터 배열을 Excel에서 열 수 있는 UTF-8 CSV 파일로 내보내는 공통 유틸리티 함수
 */
export const exportToExcel = <T extends Record<string, unknown>>({
  data,
  fileName,
  headerMap,
  excludeKeys = [],
}: ExcelExportOptions<T>): void => {
  if (!data || data.length === 0) {
    console.warn('[ExcelExport] 내보낼 데이터가 없습니다.');
    return;
  }

  const escapeCsvValue = (value: unknown): string => {
    const text = value == null ? '' : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const keys = Object.keys(data[0]).filter((key) => !excludeKeys.includes(key));
  const headers = keys.map((key) => headerMap?.[key] ?? key);

  const rows = data.map((item) => keys.map((key) => escapeCsvValue(item[key])).join(','));
  const csvContent = [
    headers.map(escapeCsvValue).join(','),
    ...rows,
  ].join('\r\n');

  const finalFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = finalFileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
