import { axiosClient } from '../../api/axiosClient';
import type {
  InboundCreateRequest,
  InboundCreateResponse,
  InboundResponse,
  InboundSummaryResponse,
  InboundSearchRequest,
  InboundCompleteRequest,
  InboundCompleteResponse,
} from './inbound';

/**
 * [POST] /api/inbounds
 * 입고 지시 등록
 */
export const createInboundApi = async (
  data: InboundCreateRequest
): Promise<InboundCreateResponse> => {
  const response = await axiosClient.post<InboundCreateResponse>('/api/inbounds', data);
  return response.data;
};

/**
 * [GET] /api/inbounds/{id}
 * 입고 단건 상세 조회
 */
export const getInboundApi = async (id: number): Promise<InboundResponse> => {
  const response = await axiosClient.get<InboundResponse>(`/api/inbounds/${id}`);
  return response.data;
};

/**
 * [GET] /api/inbounds
 * 입고 목록 검색/조회 (페이징)
 */
export const getInboundListApi = async (params?: InboundSearchRequest) => {
  const response = await axiosClient.get<{
    content: InboundSummaryResponse[];
    totalElements: number;
    totalPages: number;
  }>('/api/inbounds', { params });
  return response.data;
};

/**
 * [PUT] /api/inbounds/{id}/complete
 * 입고 확정 처리
 */
export const completeInboundApi = async (
  id: number,
  data: InboundCompleteRequest
): Promise<InboundCompleteResponse> => {
  const response = await axiosClient.put<InboundCompleteResponse>(
    `/api/inbounds/${id}/complete`,
    data
  );
  return response.data;
};

/**
 * [PUT] /api/inbounds/{id}/cancel
 * 입고 취소 처리
 */
export const cancelInboundApi = async (id: number): Promise<void> => {
  await axiosClient.put(`/api/inbounds/${id}/cancel`);
};
