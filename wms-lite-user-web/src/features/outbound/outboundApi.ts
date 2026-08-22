import { axiosClient } from '../../api/axiosClient';
import type {
  OutboundCreateRequest,
  OutboundCreateResponse,
  OutboundResponse,
  OutboundSummaryResponse,
  OutboundSearchRequest,
  OutboundCompleteRequest,
  OutboundCompleteResponse,
} from './outbound';

/**
 * [POST] /api/outbounds
 * 출고 지시 등록
 */
export const createOutboundApi = async (
  data: OutboundCreateRequest
): Promise<OutboundCreateResponse> => {
  const response = await axiosClient.post<OutboundCreateResponse>('/api/outbounds', data);
  return response.data;
};

/**
 * [GET] /api/outbounds/{id}
 * 출고 단건 상세 조회
 */
export const getOutboundApi = async (id: number): Promise<OutboundResponse> => {
  const response = await axiosClient.get<OutboundResponse>(`/api/outbounds/${id}`);
  return response.data;
};

/**
 * [GET] /api/outbounds
 * 출고 목록 검색/조회 (페이징)
 */
export const getOutboundListApi = async (params?: OutboundSearchRequest) => {
  const response = await axiosClient.get<{
    content: OutboundSummaryResponse[];
    totalElements: number;
    totalPages: number;
  }>('/api/outbounds', { params });
  return response.data;
};

/**
 * [PUT] /api/outbounds/{id}/complete
 * 출고 확정 처리
 */
export const completeOutboundApi = async (
  id: number,
  data: OutboundCompleteRequest
): Promise<OutboundCompleteResponse> => {
  const response = await axiosClient.put<OutboundCompleteResponse>(
    `/api/outbounds/${id}/complete`,
    data
  );
  return response.data;
};

/**
 * [PUT] /api/outbounds/{id}/cancel
 * 출고 취소 처리
 */
export const cancelOutboundApi = async (id: number): Promise<void> => {
  await axiosClient.put(`/api/outbounds/${id}/cancel`);
};
