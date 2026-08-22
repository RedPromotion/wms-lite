import { axiosClient } from '../../api/axiosClient';
import type { LoginRequest, LoginResponse, LoginHistoryItemResponse } from './auth';

/**
 * 1. 현장 작업자/회원 로그인 API
 * POST /api/members/login
 */
export const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>('/api/members/login', credentials);
  return response.data;
};

/**
 * 2. 토큰 재발급 API
 * POST /api/members/reissue
 */
export const reissueApi = async (refreshToken: string): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>('/api/members/reissue', { refreshToken });
  return response.data;
};

/**
 * 3. 로그아웃 API
 * POST /api/members/logout
 */
export const logoutApi = async (): Promise<void> => {
  await axiosClient.post('/api/members/logout');
};

/**
 * 4. 본인 로그인 접속 이력 (Audit Log) 조회 API
 * GET /api/members/me/login-history
 */
export const getLoginHistoryApi = async (params?: { page?: number; size?: number }) => {
  const response = await axiosClient.get<{
    content: LoginHistoryItemResponse[];
    totalElements: number;
    totalPages: number;
  }>('/api/members/me/login-history', { params });
  return response.data;
};

