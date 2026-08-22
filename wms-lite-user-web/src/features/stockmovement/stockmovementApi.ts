import { axiosClient } from '../../api/axiosClient';
import type {
  MovementCreateRequest,
  MovementCreateResponse,
  MovementResponse,
  MovementSummaryResponse,
  MovementSearchRequest,
  MovementCompleteRequest,
  MovementCompleteResponse,
} from './stockmovement';

/**
 * [POST] /api/movements
 * 재고 이동 요청 등록
 */
export const createMovementApi = async (
  data: MovementCreateRequest
): Promise<MovementCreateResponse> => {
  const payload = {
    items: [
      {
        itemId: data.itemId,
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
        quantity: data.quantity,
      },
    ],
    description: data.reason || '',
  };
  const response = await axiosClient.post<MovementCreateResponse>('/api/movements', payload);
  return response.data;
};

/**
 * [GET] /api/movements/{id}
 * 재고 이동 단건 상세 조회
 */
export const getMovementApi = async (id: number): Promise<MovementResponse> => {
  const response = await axiosClient.get<MovementResponse>(`/api/movements/${id}`);
  return response.data;
};

/**
 * [GET] /api/movements
 * 재고 이동 목록 검색/조회 (페이징)
 */
export const getMovementListApi = async (params?: MovementSearchRequest) => {
  const response = await axiosClient.get<{
    content: MovementSummaryResponse[];
    totalElements: number;
    totalPages: number;
  }>('/api/movements', { params });
  return response.data;
};

/**
 * [PUT] /api/movements/{id}/complete
 * 재고 이동 확정 처리
 */
export const completeMovementApi = async (
  id: number,
  data: MovementCompleteRequest
): Promise<MovementCompleteResponse> => {
  const response = await axiosClient.put<MovementCompleteResponse>(
    `/api/movements/${id}/complete`,
    data
  );
  return response.data;
};

/**
 * [PUT] /api/movements/{id}/cancel
 * 재고 이동 취소 처리
 */
export const cancelMovementApi = async (id: number): Promise<void> => {
  await axiosClient.put(`/api/movements/${id}/cancel`);
};
