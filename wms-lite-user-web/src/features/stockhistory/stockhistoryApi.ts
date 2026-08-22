import { axiosClient } from '../../api/axiosClient';
import type { StockHistorySummaryResponse, StockHistorySearchRequest } from './stockhistory';

/**
 * [GET] /api/stock-histories
 * 재고 수불 이력 목록 조회 (페이징/검색)
 */
export const getStockHistoryListApi = async (params?: StockHistorySearchRequest) => {
  const response = await axiosClient.get<{
    content: StockHistorySummaryResponse[];
    totalElements: number;
    totalPages: number;
  }>('/api/stock-histories', { params });
  return response.data;
};
