import { axiosClient } from '../../../api/axiosClient';
import type { PageResponse } from '../../../types/common';
import type {
  ItemResponse,
  ItemSummaryResponse,
  ItemSearchRequest,
  ItemCreateRequest,
  ItemUpdateRequest,
  ItemCategoryResponse,
  ItemStatus,
} from './item';

/**
 * 1. 품목 목록 페이징 및 검색 조회
 * GET /api/items
 */
export const getItemsApi = async (
  params?: ItemSearchRequest
): Promise<PageResponse<ItemSummaryResponse>> => {
  const response = await axiosClient.get<PageResponse<ItemSummaryResponse>>('/api/items', {
    params,
  });
  return response.data;
};

/**
 * 2. 품목 단건 상세 조회
 * GET /api/items/{id}
 */
export const getItemDetailApi = async (id: number): Promise<ItemResponse> => {
  const response = await axiosClient.get<ItemResponse>(`/api/items/${id}`);
  return response.data;
};

/**
 * 3. 품목 신규 등록
 * POST /api/items
 */
export const createItemApi = async (data: ItemCreateRequest): Promise<ItemResponse> => {
  const response = await axiosClient.post<ItemResponse>('/api/items', data);
  return response.data;
};

/**
 * 4. 품목 정보 수정
 * PUT /api/items/{id}
 */
export const updateItemApi = async (
  id: number,
  data: ItemUpdateRequest
): Promise<ItemResponse> => {
  const response = await axiosClient.put<ItemResponse>(`/api/items/${id}`, data);
  return response.data;
};

/**
 * 5. 품목 삭제 (Soft Delete)
 * DELETE /api/items/{id}
 */
export const deleteItemApi = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/items/${id}`);
};

/**
 * 6. 품목 사용 상태 변경 (ACTIVE / INACTIVE)
 * PUT /api/items/{id}/status
 */
export const changeItemStatusApi = async (
  id: number,
  status: ItemStatus
): Promise<ItemResponse> => {
  const response = await axiosClient.put<ItemResponse>(`/api/items/${id}/status`, { status });
  return response.data;
};

/**
 * 7. 품목 카테고리 목록 조회 (등록/수정 폼 셀렉트 박스용)
 * GET /api/item-categories
 */
export const getItemCategoriesApi = async (): Promise<ItemCategoryResponse[]> => {
  const response = await axiosClient.get<ItemCategoryResponse[]>('/api/item-categories');
  return response.data;
};
