/**
 * 품목(Item) 및 품목 카테고리(ItemCategory) 도메인 관련 타입 정의
 * 백엔드 wms-lite-server (com.wms.wms_lite.domain.master.item) DTO 스펙에 대응
 */

// 단위 (Unit) Enum
export type UnitType = 'EA' | 'BOX' | 'PALLET' | 'KG' | 'L' | 'M' | 'SET';

// 품목 사용 상태 Enum
export type ItemStatus = 'ACTIVE' | 'INACTIVE';

/**
 * 품목 카테고리 응답 DTO
 */
export interface ItemCategoryResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  status?: ItemStatus;
}

/**
 * 품목 단건 상세 응답 DTO (ItemResponse)
 */
export interface ItemResponse {
  id: number;
  code: string;
  name: string;
  barcode?: string;
  specification?: string;
  description?: string;
  supplierName?: string;
  supplierId?: number;
  categoryName?: string;
  categoryId?: number;
  unit: UnitType;
  status: ItemStatus;
  safetyStockQuantity?: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 품목 요약 목록 응답 DTO (ItemSummaryResponse)
 */
export interface ItemSummaryResponse {
  id: number;
  code: string;
  name: string;
  barcode?: string;
  specification?: string;
  supplierName?: string;
  categoryName?: string;
  unit: UnitType;
  status?: ItemStatus;
  safetyStockQuantity?: number | null;
}

/**
 * 품목 검색 및 필터 요청 DTO (ItemSearchRequest)
 */
export interface ItemSearchRequest {
  keyword?: string;
  supplierId?: number;
  categoryId?: number;
  status?: ItemStatus;
  page?: number;
  size?: number;
}

/**
 * 품목 신규 등록 요청 DTO (ItemCreateRequest)
 */
export interface ItemCreateRequest {
  code: string;
  name: string;
  barcode?: string;
  supplierId?: number;
  categoryId?: number;
  unit: UnitType;
  specification?: string;
  description?: string;
  safetyStockQuantity?: number | null;
}

/**
 * 품목 정보 수정 요청 DTO (ItemUpdateRequest)
 */
export interface ItemUpdateRequest {
  name: string;
  barcode?: string;
  supplierId?: number;
  categoryId?: number;
  unit: UnitType;
  specification?: string;
  description?: string;
  safetyStockQuantity?: number | null;
}

/**
 * 품목 상태 변경 요청 DTO (ItemStatusChangeRequest)
 */
export interface ItemStatusChangeRequest {
  status: ItemStatus;
}
