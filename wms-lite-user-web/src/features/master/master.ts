/**
 * 마스터 기준정보 (Master Data) 도메인 관련 타입 정의
 */

// 1. 창고 & 로케이션 (Warehouse & Location)
export interface WarehouseResponse {
  id: number;
  warehouseCode: string;
  warehouseName: string;
  locationDescription?: string;
  useYn: boolean;
}

export interface LocationResponse {
  id: number;
  warehouseId: number;
  warehouseName: string;
  locationCode: string;
  zone?: string;
  rack?: string;
  level?: string;
  useYn: boolean;
}

// 2. 품목 & 카테고리 (Item & Item Category)
export interface ItemCategoryResponse {
  id: number;
  categoryCode: string;
  categoryName: string;
  description?: string;
}

export interface ItemResponse {
  id: number;
  itemCode: string;
  itemName: string;
  categoryId: number;
  categoryName: string;
  unit: string;
  spec?: string;
  barcode?: string;
  safetyStockQuantity?: number;
  useYn: boolean;
}

// 3. 거래처 & 공급업체 (Customer & Supplier)
export interface CustomerResponse {
  id: number;
  customerCode: string;
  customerName: string;
  businessNo?: string;
  ceoName?: string;
  phone?: string;
  email?: string;
  address?: string;
  useYn: boolean;
}

export interface SupplierResponse {
  id: number;
  supplierCode: string;
  supplierName: string;
  businessNo?: string;
  phone?: string;
  email?: string;
  useYn: boolean;
}
