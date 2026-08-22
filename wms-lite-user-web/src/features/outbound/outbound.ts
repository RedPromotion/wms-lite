/**
 * 출고 (Outbound) 도메인 관련 타입 정의
 */

export type OutboundStatus = 'REQUESTED' | 'PICKING' | 'COMPLETED' | 'CANCELED';

export interface OutboundItemRequest {
  itemId: number;
  locationId: number;
  quantity: number;
}

export interface OutboundCreateRequest {
  customerId: number;
  deliveryAddressId?: number;
  items: OutboundItemRequest[];
  description?: string;
}

export interface OutboundItemResponse {
  itemId: number;
  itemCode: string;
  itemName: string;
  locationCode: string;
  locationName: string;
  quantity: number; // 출고 요청 수량
  pickedQuantity?: number; // 피킹 완료 수량
}

export interface OutboundResponse {
  id: number;
  outboundNo: string;
  customerCode?: string;
  customerName?: string;
  deliveryAddressName?: string;
  status: OutboundStatus;
  items: OutboundItemResponse[];
  completedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface OutboundSummaryResponse {
  id: number;
  outboundNo: string;
  customerName?: string;
  status: OutboundStatus;
  createdAt: string;
}

export interface OutboundSearchRequest {
  customerId?: number;
  status?: OutboundStatus;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface OutboundCompleteRequest {
  description?: string;
}

export interface OutboundCreateResponse {
  id: number;
  outboundNo: string;
  customerName?: string;
  status: OutboundStatus;
}

export interface OutboundCompleteResponse {
  id: number;
  outboundNo: string;
  customerName?: string;
  status: OutboundStatus;
  completedAt: string;
}
