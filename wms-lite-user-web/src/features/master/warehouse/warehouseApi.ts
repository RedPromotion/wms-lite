import { axiosClient } from '../../../api/axiosClient';
import type { PageResponse } from '../../../types/common';
import type {
  WarehouseResponse,
  WarehouseSummaryResponse,
  WarehouseSearchRequest,
  WarehouseCreateRequest,
  WarehouseUpdateRequest,
} from './warehouse';

/**
 * 1. 창고 목록 페이징 및 검색 조회
 * GET /api/warehouses
 */
export const getWarehousesApi = async (
  params?: WarehouseSearchRequest
): Promise<PageResponse<WarehouseSummaryResponse>> => {
  const response = await axiosClient.get<PageResponse<WarehouseSummaryResponse>>('/api/warehouses', {
    params,
  });
  return response.data;
};

/**
 * 2. 창고 단건 상세 조회
 * GET /api/warehouses/{id}
 */
export const getWarehouseDetailApi = async (id: number): Promise<WarehouseResponse> => {
  const response = await axiosClient.get<WarehouseResponse>(`/api/warehouses/${id}`);
  return response.data;
};

/**
 * 3. 창고 신규 등록
 * POST /api/warehouses
 */
export const createWarehouseApi = async (
  data: WarehouseCreateRequest
): Promise<WarehouseResponse> => {
  const response = await axiosClient.post<WarehouseResponse>('/api/warehouses', data);
  return response.data;
};

/**
 * 4. 창고 정보 수정
 * PUT /api/warehouses/{id}
 */
export const updateWarehouseApi = async (
  id: number,
  data: WarehouseUpdateRequest
): Promise<WarehouseResponse> => {
  const response = await axiosClient.put<WarehouseResponse>(`/api/warehouses/${id}`, data);
  return response.data;
};

/**
 * 5. 창고 삭제
 * DELETE /api/warehouses/{id}
 */
export const deleteWarehouseApi = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/warehouses/${id}`);
};
