/**
 * 인증 (Auth) 및 회원 로그인 관련 타입 정의
 * 백엔드 wms-lite-server (/api/members/login) DTO 스펙 대응
 */

export interface LoginRequest {
  loginId: string;
  password?: string;
}

export interface LoginResponse {
  memberId: number;
  loginId: string;
  name: string;
  department: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface UserAuthInfo {
  memberId: number;
  loginId: string;
  name: string;
  department: string;
  role: string;
}

export interface LoginHistoryItemResponse {
  id: number;
  loginId: string;
  ipAddress: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED' | 'LOGOUT';
  loginAt: string;
}
