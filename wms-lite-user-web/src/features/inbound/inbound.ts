/**
 * 입고 (Inbound) 도메인 관련 타입 정의
 */

export type InboundStatus = 'REQUESTED' | 'COMPLETED' | 'CANCELED';

export interface InboundItemRequest {
  itemId: number;
  locationId: number;
  quantity: number;
}

export interface InboundCreateRequest {
  supplierId: number;
  items: InboundItemRequest[];
  description?: string;
}

export interface InboundItemResponse {
  itemId: number;
  itemCode: string;
  itemName: string;
  locationCode: string;
  locationName: string;
  quantity: number;
}

export interface InboundResponse {
  id: number;
  inboundNo: string;
  supplierCode?: string;
  supplierName?: string;
  status: InboundStatus;
  items: InboundItemResponse[];
  completedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface InboundSummaryResponse {
  id: number;
  inboundNo: string;
  supplierName?: string;
  status: InboundStatus;
  createdAt: string;
}

export interface InboundSearchRequest {
  supplierId?: number;
  status?: InboundStatus;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface InboundCompleteRequest {
  description?: string;
}

export interface InboundCreateResponse {
  id: number;
  inboundNo: string;
  supplierName?: string;
  status: InboundStatus;
}

export interface InboundCompleteResponse {
  id: number;
  inboundNo: string;
  supplierName?: string;
  status: InboundStatus;
  completedAt: string;
}

