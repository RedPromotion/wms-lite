/**
 * 숫자에 3자리 마다 쉼표(,) 추가
 */
export const formatNumber = (value?: number): string => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('ko-KR');
};

/**
 * 수량과 단위를 조합하여 포맷팅 (예: 1,420 PAL, 50 EA)
 */
export const formatQuantity = (value?: number, unit: string = 'EA'): string => {
  return `${formatNumber(value)} ${unit}`;
};
