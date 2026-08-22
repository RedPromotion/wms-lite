/**
 * 창고 (Warehouse) 도메인 관련 타입 정의
 * 백엔드 wms-lite-server DB (warehouses) 스펙 대응
 */

/**
 * 창고 상세 응답 DTO (WarehouseResponse)
 */
export interface WarehouseResponse {
  id: number;
  code: string;
  name: string;
  address?: string;
  manager?: string;
  phone?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 창고 요약 목록 응답 DTO (WarehouseSummaryResponse)
 */
export interface WarehouseSummaryResponse {
  id: number;
  code: string;
  name: string;
  address?: string;
  manager?: string;
  phone?: string;
}

/**
 * 창고 검색 요청 DTO (WarehouseSearchRequest)
 */
export interface WarehouseSearchRequest {
  keyword?: string;
  page?: number;
  size?: number;
}

/**
 * 창고 등록 요청 DTO (WarehouseCreateRequest)
 */
export interface WarehouseCreateRequest {
  code: string;
  name: string;
  address?: string;
  manager?: string;
  phone?: string;
  description?: string;
}

/**
 * 창고 수정 요청 DTO (WarehouseUpdateRequest)
 */
export interface WarehouseUpdateRequest {
  name: string;
  address?: string;
  manager?: string;
  phone?: string;
  description?: string;
}
