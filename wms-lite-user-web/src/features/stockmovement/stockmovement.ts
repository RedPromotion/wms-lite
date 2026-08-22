/**
 * 재고 이동 (Stock Movement) 도메인 관련 타입 정의
 */

export type MovementStatus = 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export interface MovementCreateRequest {
  fromLocationId: number;
  toLocationId: number;
  itemId: number;
  quantity: number;
  reason?: string;
}

export interface MovementResponse {
  id: number;
  movementCode: string;
  fromLocationId: number;
  fromLocationCode: string;
  toLocationId: number;
  toLocationCode: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  status: MovementStatus;
  requestedAt: string;
  completedAt?: string | null;
  reason?: string;
}

export interface MovementSummaryResponse {
  id: number;
  movementCode: string;
  fromLocationCode: string;
  toLocationCode: string;
  itemName: string;
  quantity: number;
  status: MovementStatus;
  requestedAt: string;
}

export interface MovementSearchRequest {
  status?: MovementStatus;
  fromLocationId?: number;
  toLocationId?: number;
  itemId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface MovementCompleteRequest {
  movedQuantity: number;
  memo?: string;
}

export interface MovementCreateResponse {
  id: number;
  movementCode: string;
  status: MovementStatus;
}

export interface MovementCompleteResponse {
  id: number;
  movementCode: string;
  status: MovementStatus;
  completedAt: string;
}
