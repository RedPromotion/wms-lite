import { axiosClient } from '../../../api/axiosClient';
import type { PageResponse } from '../../../types/common';
import type {
  SupplierResponse,
  SupplierSummaryResponse,
  SupplierSearchRequest,
  SupplierCreateRequest,
  SupplierUpdateRequest,
} from './supplier';

/**
 * 1. 공급업체 목록 페이징 및 검색 조회
 * GET /api/suppliers
 */
export const getSuppliersApi = async (
  params?: SupplierSearchRequest
): Promise<PageResponse<SupplierSummaryResponse>> => {
  const response = await axiosClient.get<PageResponse<SupplierSummaryResponse>>('/api/suppliers', {
    params,
  });
  return response.data;
};

/**
 * 2. 공급업체 단건 상세 조회
 * GET /api/suppliers/{id}
 */
export const getSupplierDetailApi = async (id: number): Promise<SupplierResponse> => {
  const response = await axiosClient.get<SupplierResponse>(`/api/suppliers/${id}`);
  return response.data;
};

/**
 * 3. 공급업체 신규 등록
 * POST /api/suppliers
 */
export const createSupplierApi = async (
  data: SupplierCreateRequest
): Promise<SupplierResponse> => {
  const response = await axiosClient.post<SupplierResponse>('/api/suppliers', data);
  return response.data;
};

/**
 * 4. 공급업체 정보 수정
 * PUT /api/suppliers/{id}
 */
export const updateSupplierApi = async (
  id: number,
  data: SupplierUpdateRequest
): Promise<SupplierResponse> => {
  const response = await axiosClient.put<SupplierResponse>(`/api/suppliers/${id}`, data);
  return response.data;
};

/**
 * 5. 공급업체 삭제 (Soft Delete)
 * DELETE /api/suppliers/{id}
 */
export const deleteSupplierApi = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/suppliers/${id}`);
};
