/**
 * 시스템 전역 공통 타입 및 API 응답 래퍼 인터페이스
 */

/**
 * Spring Boot 공통 페이징 응답 래퍼 인터페이스
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * 백엔드 공통 API 응답 봉투(Envelope) 인터페이스
 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}
