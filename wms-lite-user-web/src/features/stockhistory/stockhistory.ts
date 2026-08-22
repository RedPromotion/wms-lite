/**
 * 재고 수불 이력 (Stock History) 도메인 관련 타입 정의
 */

export type HistoryType = 'INBOUND' | 'OUTBOUND' | 'MOVEMENT_IN' | 'MOVEMENT_OUT' | 'ADJUSTMENT';

export interface StockHistorySummaryResponse {
  id: number;
  itemCode: string;
  itemName: string;
  locationCode?: string;
  historyType: HistoryType;
  beforeQuantity: number | null;
  changeQuantity: number;
  afterQuantity: number | null;
  referenceNo?: string;
  description?: string;
  sourceLocation?: string;
  targetLocation?: string;
  partnerName?: string;
  createdAt: string;
}

export interface StockHistorySearchRequest {
  itemId?: number;
  locationId?: number;
  historyType?: HistoryType;
  referenceNo?: string;
  keyword?: string;
  startDate?: string;  // 'YYYY-MM-DD'
  endDate?: string;    // 'YYYY-MM-DD'
  page?: number;
  size?: number;
}
