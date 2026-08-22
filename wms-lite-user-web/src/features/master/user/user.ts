/**
 * 사용자/현장 작업자 (Member/User) 도메인 관련 타입 정의
 * 백엔드 wms-lite-server (com.wms.wms_lite.domain.user.member) DTO 및 Enum 스펙 대응
 */

// 부서 (Department) Enum
export type DepartmentType =
  | 'WAREHOUSE_OPERATOR'
  | 'INBOUND_OPERATOR'
  | 'OUTBOUND_OPERATOR'
  | 'INVENTORY_AUDITOR'
  | 'VIEWER';

// 권한 (MemberRole) Enum
export type MemberRoleType = 'ROLE_MANAGER' | 'ROLE_OPERATOR' | 'ROLE_VIEWER';

/**
 * 사용자 상세 응답 DTO (MemberResponse)
 */
export interface MemberResponse {
  id: number;
  loginId: string;
  name: string;
  email: string;
  phone?: string;
  department: DepartmentType;
  role: MemberRoleType;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 사용자 검색 요청 DTO (MemberSearchRequest)
 */
export interface MemberSearchRequest {
  keyword?: string;
  department?: DepartmentType;
  role?: MemberRoleType;
  page?: number;
  size?: number;
}

/**
 * 사용자 신규 등록 요청 DTO (MemberCreateRequest)
 */
export interface MemberCreateRequest {
  loginId: string;
  password?: string;
  name: string;
  email: string;
  phone?: string;
  department: DepartmentType;
  role: MemberRoleType;
}

/**
 * 사용자 정보 수정 요청 DTO (MemberUpdateRequest)
 */
export interface MemberUpdateRequest {
  name: string;
  email: string;
  phone?: string;
  department: DepartmentType;
  role: MemberRoleType;
  password?: string;
}
