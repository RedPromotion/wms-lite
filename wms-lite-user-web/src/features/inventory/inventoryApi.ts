import { axiosClient } from '../../api/axiosClient';
import type {
  InventoryResponse,
  InventorySummaryResponse,
  InventorySearchRequest,
  InventoryAdjustRequest,
  InventoryAdjustResponse,
  InventoryReserveRequest,
} from './inventory';

/**
 * [GET] /api/inventories/{id}
 * 재고 단건 상세 조회
 */
export const getInventoryApi = async (id: number): Promise<InventoryResponse> => {
  const response = await axiosClient.get<InventoryResponse>(`/api/inventories/${id}`);
  return response.data;
};

/**
 * [GET] /api/inventories
 * 재고 목록 조회 (페이징/검색)
 */
export const getInventoryListApi = async (params?: InventorySearchRequest) => {
  const response = await axiosClient.get<{
    content: InventorySummaryResponse[];
    totalElements: number;
    totalPages: number;
  }>('/api/inventories', { params });
  return response.data;
};

/**
 * [PUT] /api/inventories/{id}/adjust
 * 재고 실사/조정 처리
 */
export const adjustInventoryApi = async (
  id: number,
  data: InventoryAdjustRequest
): Promise<InventoryAdjustResponse> => {
  const response = await axiosClient.put<InventoryAdjustResponse>(
    `/api/inventories/${id}/adjust`,
    data
  );
  return response.data;
};

/**
 * [PUT] /api/inventories/{id}/reserve
 * 재고 할당(예약) 처리
 */
export const reserveInventoryApi = async (
  id: number,
  data: InventoryReserveRequest
): Promise<InventoryResponse> => {
  const response = await axiosClient.put<InventoryResponse>(
    `/api/inventories/${id}/reserve`,
    data
  );
  return response.data;
};

/**
 * [PUT] /api/inventories/{id}/release
 * 재고 할당 해제 처리
 */
export interface StockHistoryResponse {
  id: number;
  itemCode: string;
  itemName: string;
  locationCode: string;
  historyType: 'INBOUND' | 'OUTBOUND' | 'MOVEMENT' | 'ADJUSTMENT';
  beforeQuantity: number;
  changeQuantity: number;
  afterQuantity: number;
  referenceNo?: string;
  createdAt: string;
}

export const getStockHistoriesApi = async (params?: {
  itemId?: number;
  locationId?: number;
  historyType?: string;
  page?: number;
  size?: number;
}) => {
  const response = await axiosClient.get<{
    content: StockHistoryResponse[];
    totalElements: number;
    totalPages: number;
  }>('/api/stock-histories', { params });
  return response.data;
};
