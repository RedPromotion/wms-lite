/**
 * 재고 (Inventory) 도메인 관련 타입 정의
 */

export interface InventoryResponse {
  id: number;
  warehouseId: number;
  warehouseName: string;
  locationId: number;
  locationCode: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  allocatedQuantity: number;
  availableQuantity: number;
  lotNumber?: string;
  updatedAt: string;
}

export interface InventorySummaryResponse {
  id: number;
  locationId?: number;
  warehouseName: string;
  locationCode: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  allocatedQuantity: number;
  availableQuantity: number;
  safetyStockQuantity?: number;
  updatedAt: string;
}

export interface InventorySearchRequest {
  warehouseId?: number;
  locationId?: number;
  itemId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface InventoryAdjustRequest {
  newQuantity: number;
  reason: string;
}

export interface InventoryAdjustResponse {
  id: number;
  previousQuantity: number;
  adjustedQuantity: number;
  reason: string;
  adjustedAt: string;
}

export interface InventoryReserveRequest {
  quantity: number;
}

export interface InventoryReleaseRequest {
  quantity: number;
}
