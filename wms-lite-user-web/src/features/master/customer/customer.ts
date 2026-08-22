/**
 * 고객사 (Customer) 도메인 관련 타입 정의
 * 백엔드 wms-lite-server (com.wms.wms_lite.domain.master.customer) DTO 스펙 대응
 */

export interface CustomerResponse {
  id: number;
  code: string;
  name: string;
  businessNo?: string;
  ceoName?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerSummaryResponse {
  id: number;
  code: string;
  name: string;
  businessNo?: string;
  ceoName?: string;
  phone?: string;
  email?: string;
}

export interface CustomerSearchRequest {
  keyword?: string;
  page?: number;
  size?: number;
}

export interface CustomerCreateRequest {
  code: string;
  name: string;
  businessNo?: string;
  ceoName?: string;
  phone?: string;
  email?: string;
}

export interface CustomerUpdateRequest {
  name: string;
  businessNo?: string;
  ceoName?: string;
  phone?: string;
  email?: string;
}
