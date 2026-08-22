/**
 * 공급업체 (Supplier) 도메인 관련 타입 정의
 * 백엔드 wms-lite-server (com.wms.wms_lite.domain.master.supplier) DTO 스펙 대응
 */

export interface SupplierResponse {
  id: number;
  code: string;
  name: string;
  businessNo?: string;
  ceoName?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierSummaryResponse {
  id: number;
  code: string;
  name: string;
  businessNo?: string;
  ceoName?: string;
  phone?: string;
  email?: string;
}

export interface SupplierSearchRequest {
  keyword?: string;
  page?: number;
  size?: number;
}

export interface SupplierCreateRequest {
  code: string;
  name: string;
  businessNo?: string;
  ceoName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface SupplierUpdateRequest {
  name: string;
  businessNo?: string;
  ceoName?: string;
  phone?: string;
  email?: string;
  address?: string;
}
