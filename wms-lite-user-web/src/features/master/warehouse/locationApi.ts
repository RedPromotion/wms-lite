import { axiosClient } from '../../../api/axiosClient';
import type { PageResponse } from '../../../types/common';
import type {
  LocationResponse,
  LocationSummaryResponse,
  LocationCreateRequest,
  LocationUpdateRequest,
} from './location';

/**
 * 1. 특정 창고의 로케이션 목록 조회
 * GET /api/warehouses/{warehouseId}/locations
 */
export const getLocationsByWarehouseApi = async (
  warehouseId: number
): Promise<LocationResponse[]> => {
  const response = await axiosClient.get<PageResponse<LocationSummaryResponse> | LocationResponse[]>(
    `/api/warehouses/${warehouseId}/locations`,
    { params: { size: 500 } }
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && 'content' in response.data && Array.isArray(response.data.content)) {
    return response.data.content as unknown as LocationResponse[];
  }
  return [];
};

/**
 * 2. 특정 창고에 신규 로케이션 등록
 * POST /api/warehouses/{warehouseId}/locations
 */
export const createLocationApi = async (
  warehouseId: number,
  data: LocationCreateRequest
): Promise<LocationResponse> => {
  const response = await axiosClient.post<LocationResponse>(
    `/api/warehouses/${warehouseId}/locations`,
    data
  );
  return response.data;
};

/**
 * 3. 로케이션 정보 수정
 * PUT /api/warehouses/{warehouseId}/locations/{locationId}
 */
export const updateLocationApi = async (
  warehouseId: number,
  locationId: number,
  data: LocationUpdateRequest
): Promise<LocationResponse> => {
  const response = await axiosClient.put<LocationResponse>(
    `/api/warehouses/${warehouseId}/locations/${locationId}`,
    data
  );
  return response.data;
};

/**
 * 4. 로케이션 삭제
 * DELETE /api/warehouses/{warehouseId}/locations/{locationId}
 */
export const deleteLocationApi = async (
  warehouseId: number,
  locationId: number
): Promise<void> => {
  await axiosClient.delete(`/api/warehouses/${warehouseId}/locations/${locationId}`);
};
