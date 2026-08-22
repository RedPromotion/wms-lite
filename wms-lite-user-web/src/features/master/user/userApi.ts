import { axiosClient } from '../../../api/axiosClient';
import type { PageResponse } from '../../../types/common';
import type {
  MemberResponse,
  MemberSearchRequest,
  MemberCreateRequest,
  MemberUpdateRequest,
} from './user';

/**
 * 1. 사용자 목록 페이징 및 검색 조회
 * GET /api/members
 */
export const getMembersApi = async (
  params?: MemberSearchRequest
): Promise<PageResponse<MemberResponse>> => {
  const response = await axiosClient.get<PageResponse<MemberResponse>>('/api/members', {
    params,
  });
  return response.data;
};

/**
 * 2. 사용자 단건 상세 조회
 * GET /api/members/{id}
 */
export const getMemberDetailApi = async (id: number): Promise<MemberResponse> => {
  const response = await axiosClient.get<MemberResponse>(`/api/members/${id}`);
  return response.data;
};

/**
 * 3. 사용자 신규 등록
 * POST /api/members
 */
export const createMemberApi = async (data: MemberCreateRequest): Promise<MemberResponse> => {
  const response = await axiosClient.post<MemberResponse>('/api/members', data);
  return response.data;
};

/**
 * 4. 사용자 정보 수정
 * PUT /api/members/{id}
 */
export const updateMemberApi = async (
  id: number,
  data: MemberUpdateRequest
): Promise<MemberResponse> => {
  const response = await axiosClient.put<MemberResponse>(`/api/members/${id}`, data);
  return response.data;
};

/**
 * 5. 사용자 계정 삭제 (Soft Delete)
 * DELETE /api/members/{id}
 */
export const deleteMemberApi = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/members/${id}`);
};
