import { axiosClient } from '../../../api/axiosClient';
import type { PageResponse } from '../../../types/common';
import type {
  CustomerResponse,
  CustomerSummaryResponse,
  CustomerSearchRequest,
  CustomerCreateRequest,
  CustomerUpdateRequest,
} from './customer';

/**
 * 1. 고객사 목록 페이징 및 검색 조회
 * GET /api/customers
 */
export const getCustomersApi = async (
  params?: CustomerSearchRequest
): Promise<PageResponse<CustomerSummaryResponse>> => {
  const response = await axiosClient.get<PageResponse<CustomerSummaryResponse>>('/api/customers', {
    params,
  });
  return response.data;
};

/**
 * 2. 고객사 단건 상세 조회
 * GET /api/customers/{id}
 */
export const getCustomerDetailApi = async (id: number): Promise<CustomerResponse> => {
  const response = await axiosClient.get<CustomerResponse>(`/api/customers/${id}`);
  return response.data;
};

/**
 * 3. 고객사 신규 등록
 * POST /api/customers
 */
export const createCustomerApi = async (
  data: CustomerCreateRequest
): Promise<CustomerResponse> => {
  const response = await axiosClient.post<CustomerResponse>('/api/customers', data);
  return response.data;
};

/**
 * 4. 고객사 정보 수정
 * PUT /api/customers/{id}
 */
export const updateCustomerApi = async (
  id: number,
  data: CustomerUpdateRequest
): Promise<CustomerResponse> => {
  const response = await axiosClient.put<CustomerResponse>(`/api/customers/${id}`, data);
  return response.data;
};

/**
 * 5. 고객사 삭제 (Soft Delete)
 * DELETE /api/customers/{id}
 */
export const deleteCustomerApi = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/customers/${id}`);
};
