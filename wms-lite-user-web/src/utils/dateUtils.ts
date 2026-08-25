import dayjs from 'dayjs';

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅
 */
export const formatDate = (date?: string | Date | number): string => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * 날짜와 시간을 YYYY-MM-DD HH:mm:ss 형식으로 포맷팅
 */
export const formatDateTime = (date?: string | Date | number): string => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 시간만 HH:mm 형식으로 포맷팅
 */
export const formatTime = (date?: string | Date | number): string => {
  if (!date) return '-';
  return dayjs(date).format('HH:mm');
};
