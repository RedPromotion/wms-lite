export interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: string;
  description: string;
  pathParams?: string[];
  queryParams?: { key: string; label: string; placeholder: string; defaultValue?: string }[];
  bodyTemplate?: string;
}

export const API_CATALOG: ApiEndpoint[] = [
  // ==========================================
  // 1. 일반 사용자 (Member)
  // ==========================================
  {
    id: 'member-signup',
    name: '회원 가입 (Member Signup)',
    method: 'POST',
    path: '/api/members',
    category: '1. 일반 사용자 (Member)',
    description: '일반 현장 작업자/매니저 계정을 신규 등록합니다.',
    bodyTemplate: JSON.stringify({
      loginId: "operator1",
      password: "Password123!",
      name: "홍길동",
      phone: "010-1234-5678",
      email: "operator1@wmslite.com",
      department: "WAREHOUSE_OPERATOR",
      role: "ROLE_OPERATOR"
    }, null, 2)
  },
  {
    id: 'member-login',
    name: '회원 로그인 (Member Login)',
    method: 'POST',
    path: '/api/members/login',
    category: '1. 일반 사용자 (Member)',
    description: '일반 사용자 계정으로 로그인하여 JWT 토큰을 획득합니다.',
    bodyTemplate: JSON.stringify({
      loginId: "operator1",
      password: "Password123!"
    }, null, 2)
  },
  {
    id: 'member-logout',
    name: '회원 로그아웃 (Member Logout)',
    method: 'POST',
    path: '/api/members/logout',
    category: '1. 일반 사용자 (Member)',
    description: '로그아웃하여 세션을 만료시킵니다.'
  },
  {
    id: 'member-reissue',
    name: '회원 토큰 재발급 (Token Reissue)',
    method: 'POST',
    path: '/api/members/reissue',
    category: '1. 일반 사용자 (Member)',
    description: '유효한 Refresh Token 또는 세션 정보로 Access Token을 재발급받습니다.'
  },
  {
    id: 'member-get-self',
    name: '본인 정보 조회 (Get Self Info)',
    method: 'GET',
    path: '/api/members/{id}',
    category: '1. 일반 사용자 (Member)',
    description: '로그인한 회원 본인의 상세 프로필 정보를 조회합니다.',
    pathParams: ['id']
  },
  {
    id: 'member-list',
    name: '전체 회원 목록 조회 (List Members)',
    method: 'GET',
    path: '/api/members',
    category: '1. 일반 사용자 (Member)',
    description: '시스템에 등록된 전체 사용자 목록을 조회합니다. (페이징 가능)',
    queryParams: [
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'member-update-self',
    name: '본인 정보 수정 (Update Self Info)',
    method: 'PUT',
    path: '/api/members/{id}',
    category: '1. 일반 사용자 (Member)',
    description: '회원 본인의 연락처, 이메일, 부서 정보를 수정합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      name: "홍길동 수정",
      phone: "010-5555-6666",
      email: "operator_mod@wmslite.com",
      department: "INBOUND_OPERATOR"
    }, null, 2)
  },
  {
    id: 'member-delete-self',
    name: '회원 본인 탈퇴 (Delete Self Member)',
    method: 'DELETE',
    path: '/api/members/{id}',
    category: '1. 일반 사용자 (Member)',
    description: '회원 계정을 논리 삭제(Soft Delete) 처리합니다.',
    pathParams: ['id']
  },
  {
    id: 'member-change-password',
    name: '비밀번호 변경 (Change Password)',
    method: 'PUT',
    path: '/api/members/{id}/password',
    category: '1. 일반 사용자 (Member)',
    description: '현재 비밀번호를 검증한 후 새로운 비밀번호로 변경합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      currentPassword: "Password123!",
      newPassword: "NewPassword123!"
    }, null, 2)
  },
  {
    id: 'member-change-role',
    name: '회원 역할 변경 (Change Member Role)',
    method: 'PUT',
    path: '/api/members/{id}/role',
    category: '1. 일반 사용자 (Member)',
    description: '회원의 등급/역할을 변경합니다. (매니저 이상 가능)',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      role: "ROLE_MANAGER"
    }, null, 2)
  },
  {
    id: 'member-change-dept',
    name: '회원 부서 변경 (Change Member Department)',
    method: 'PUT',
    path: '/api/members/{id}/department',
    category: '1. 일반 사용자 (Member)',
    description: '회원의 소속 부서를 강제 조정합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      department: "OUTBOUND_OPERATOR"
    }, null, 2)
  },

  // ==========================================
  // 2. 관리자 권한 (Admin)
  // ==========================================
  {
    id: 'admin-signup',
    name: '관리자 생성 (Admin Signup)',
    method: 'POST',
    path: '/api/admin/admins',
    category: '2. 관리자 권한 (Admin)',
    description: '운영자/시스템 관리자를 신규 등록합니다.',
    bodyTemplate: JSON.stringify({
      loginId: "admin1",
      password: "Password123!",
      name: "김관리",
      phone: "010-9876-5432",
      email: "admin1@wmslite.com"
    }, null, 2)
  },
  {
    id: 'admin-login',
    name: '관리자 로그인 (Admin Login)',
    method: 'POST',
    path: '/api/admin/admins/login',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자용 JWT 토큰을 획득합니다.',
    bodyTemplate: JSON.stringify({
      loginId: "admin1",
      password: "Password123!"
    }, null, 2)
  },
  {
    id: 'admin-logout',
    name: '관리자 로그아웃 (Admin Logout)',
    method: 'POST',
    path: '/api/admin/admins/logout',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자 로그아웃 처리를 수행합니다.'
  },
  {
    id: 'admin-get',
    name: '관리자 단건 조회 (Get Admin)',
    method: 'GET',
    path: '/api/admin/admins/{id}',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자 고유 ID로 상세 정보를 조회합니다.',
    pathParams: ['id']
  },
  {
    id: 'admin-list',
    name: '관리자 목록 조회 (List Admins)',
    method: 'GET',
    path: '/api/admin/admins',
    category: '2. 관리자 권한 (Admin)',
    description: '시스템에 등록된 관리자 목록을 페이징 조회합니다.',
    queryParams: [
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'admin-update',
    name: '관리자 정보 수정 (Update Admin)',
    method: 'PUT',
    path: '/api/admin/admins/{id}',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자의 정보(이름, 연락처, 이메일)를 수정합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      name: "김관리 수정",
      phone: "010-9999-8888",
      email: "admin_mod@wmslite.com"
    }, null, 2)
  },
  {
    id: 'admin-delete',
    name: '관리자 삭제 (Delete Admin)',
    method: 'DELETE',
    path: '/api/admin/admins/{id}',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자 계정을 소프트 딜리트 처리합니다.',
    pathParams: ['id']
  },
  {
    id: 'admin-change-password',
    name: '관리자 비밀번호 강제변경 (Admin PW Change)',
    method: 'PUT',
    path: '/api/admin/admins/{id}/password',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자 본인의 비밀번호를 변경합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      currentPassword: "Password123!",
      newPassword: "NewPassword123!"
    }, null, 2)
  },
  {
    id: 'admin-change-role',
    name: '관리자 등급 권한 변경 (Admin Role Change)',
    method: 'PUT',
    path: '/api/admin/admins/{id}/role',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자 권한 등급을 조정합니다. (SUPER 등급만 가능)',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      role: "ROLE_ADMIN_SUPER"
    }, null, 2)
  },
  {
    id: 'admin-change-status',
    name: '관리자 계정 상태 제어 (Admin Status Change)',
    method: 'PUT',
    path: '/api/admin/admins/{id}/status',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자 계정을 잠그거나 해제하는 등의 상태를 강제 변경합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      status: "LOCKED"
    }, null, 2)
  },
  {
    id: 'admin-create-member',
    name: '관리자의 회원 강제등록 (Admin Create Member)',
    method: 'POST',
    path: '/api/admin/members',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자 권한으로 시스템에 작업자 계정을 즉시 삽입합니다.',
    bodyTemplate: JSON.stringify({
      loginId: "worker77",
      password: "Password123!",
      name: "이작업",
      phone: "010-7777-7777",
      email: "worker77@wmslite.com",
      department: "INVENTORY_AUDITOR",
      role: "ROLE_OPERATOR"
    }, null, 2)
  },
  {
    id: 'admin-get-member',
    name: '관리자의 회원 조회 (Admin Get Member)',
    method: 'GET',
    path: '/api/admin/members/{id}',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자가 특정 회원 정보를 상세 조회합니다.',
    pathParams: ['id']
  },
  {
    id: 'admin-list-members',
    name: '관리자의 회원 목록 조회 (Admin List Members)',
    method: 'GET',
    path: '/api/admin/members',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자가 전체 회원 리스트를 페이징 조회합니다.',
    queryParams: [
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'admin-update-member',
    name: '관리자의 회원 강제수정 (Admin Update Member)',
    method: 'PUT',
    path: '/api/admin/members/{id}',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자가 대상 회원의 이름, 연락처, 부서 등을 강제 수정합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      name: "이작업 수정",
      phone: "010-7777-1234",
      email: "worker77_mod@wmslite.com",
      department: "INVENTORY_AUDITOR"
    }, null, 2)
  },
  {
    id: 'admin-delete-member',
    name: '관리자의 회원 강제삭제 (Admin Delete Member)',
    method: 'DELETE',
    path: '/api/admin/members/{id}',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자가 회원을 즉시 탈퇴(소프트 딜리트) 시킵니다.',
    pathParams: ['id']
  },
  {
    id: 'admin-member-role',
    name: '관리자의 회원 권한 강제조정 (Admin Change Member Role)',
    method: 'PUT',
    path: '/api/admin/members/{id}/role',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자가 회원의 가용 권한을 강제 갱신합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      role: "ROLE_MANAGER"
    }, null, 2)
  },
  {
    id: 'admin-member-dept',
    name: '관리자의 회원 부서 강제조정 (Admin Change Member Dept)',
    method: 'PUT',
    path: '/api/admin/members/{id}/department',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자가 회원의 소속 부서를 강제 갱신합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      department: "WAREHOUSE_OPERATOR"
    }, null, 2)
  },
  {
    id: 'admin-member-status',
    name: '관리자의 회원 상태 강제조정 (Admin Change Member Status)',
    method: 'PUT',
    path: '/api/admin/members/{id}/status',
    category: '2. 관리자 권한 (Admin)',
    description: '관리자가 회원의 계정 상태(ACTIVE/LOCKED/INACTIVE 등)를 강제 조율합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      status: "ACTIVE"
    }, null, 2)
  },

  // ==========================================
  // 3. 기준정보 - 고객사 및 배송지
  // ==========================================
  {
    id: 'create-customer',
    name: '고객사 등록 (Create Customer)',
    method: 'POST',
    path: '/api/customers',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '화주사 또는 상품 인도 고객사를 신규 등록합니다.',
    bodyTemplate: JSON.stringify({
      code: "CUST-A",
      name: "ABC 주식회사",
      businessNo: "123-45-67890",
      ceoName: "김고객",
      phone: "02-1234-5678",
      email: "abc@customer.com",
      description: "종합 물류 위탁 화주사"
    }, null, 2)
  },
  {
    id: 'get-customer',
    name: '고객사 단건 조회 (Get Customer)',
    method: 'GET',
    path: '/api/customers/{id}',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '고객사 마스터 상세 내역을 조회합니다.',
    pathParams: ['id']
  },
  {
    id: 'list-customers',
    name: '고객사 검색 목록 조회 (List Customers)',
    method: 'GET',
    path: '/api/customers',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '키워드 및 상태별 고객사 목록을 페이징 조회합니다.',
    queryParams: [
      { key: 'keyword', label: '검색어 (코드/명)', placeholder: 'ABC' },
      { key: 'status', label: '상태 (ACTIVE/INACTIVE)', placeholder: 'ACTIVE' },
      { key: 'page', label: '페이지', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'update-customer',
    name: '고객사 정보 수정 (Update Customer)',
    method: 'PUT',
    path: '/api/customers/{id}',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '고객사 마스터 정보를 변경합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      name: "ABC 물류 유통",
      businessNo: "123-45-67890",
      ceoName: "김고객",
      phone: "02-1234-9999",
      email: "abc_mod@customer.com",
      description: "명칭 일부 수정 및 대표 연락망 변경"
    }, null, 2)
  },
  {
    id: 'delete-customer',
    name: '고객사 비활성화 삭제 (Delete Customer)',
    method: 'DELETE',
    path: '/api/customers/{id}',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '고객사를 논리적으로 삭제합니다.',
    pathParams: ['id']
  },
  {
    id: 'status-customer',
    name: '고객사 활성 상태 변경 (Change Customer Status)',
    method: 'PUT',
    path: '/api/customers/{id}/status',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '고객사의 운영 상태를 직접 변경합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      status: "ACTIVE"
    }, null, 2)
  },
  {
    id: 'create-address',
    name: '배송지 등록 (Create Delivery Address)',
    method: 'POST',
    path: '/api/customers/{customerId}/addresses',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '지정 고객사 산하에 납품할 도착 배송지를 등록합니다.',
    pathParams: ['customerId'],
    bodyTemplate: JSON.stringify({
      name: "동탄 물류센터 3호",
      receiverName: "이주임",
      receiverPhone: "010-8888-9999",
      zipCode: "18456",
      address: "경기도 화성시 동탄대로 456",
      detailAddress: "2층 입구 하역 데크",
      defaultAddress: true,
      description: "냉동 입고 불가"
    }, null, 2)
  },
  {
    id: 'list-addresses',
    name: '배송지 목록 조회 (List Delivery Addresses)',
    method: 'GET',
    path: '/api/customers/{customerId}/addresses',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '특정 고객사 산하의 모든 등록 배송지 목록을 가져옵니다.',
    pathParams: ['customerId'],
    queryParams: [
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'get-address',
    name: '배송지 단건 상세 조회 (Get Delivery Address)',
    method: 'GET',
    path: '/api/customers/{customerId}/addresses/{id}',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '배송지 고유 ID를 이용하여 상세 주소 프로필을 조회합니다.',
    pathParams: ['customerId', 'id']
  },
  {
    id: 'update-address',
    name: '배송지 수정 (Update Delivery Address)',
    method: 'PUT',
    path: '/api/customers/{customerId}/addresses/{id}',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '배송지의 수령인, 우편번호, 주소 정보를 갱신합니다.',
    pathParams: ['customerId', 'id'],
    bodyTemplate: JSON.stringify({
      name: "동탄 물류센터 3호 수정",
      receiverName: "이주임",
      receiverPhone: "010-8888-1234",
      zipCode: "18456",
      address: "경기도 화성시 동탄대로 456",
      detailAddress: "2층 입구 5번 도크",
      defaultAddress: true,
      description: "5번 데크로 변경 지정"
    }, null, 2)
  },
  {
    id: 'delete-address',
    name: '배송지 삭제 (Delete Delivery Address)',
    method: 'DELETE',
    path: '/api/customers/{customerId}/addresses/{id}',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '특정 배송지를 삭제합니다.',
    pathParams: ['customerId', 'id']
  },
  {
    id: 'status-address',
    name: '배송지 활성 상태 변경 (Change Address Status)',
    method: 'PUT',
    path: '/api/customers/{customerId}/addresses/{id}/status',
    category: '3. 기준정보 - 고객사 및 배송지',
    description: '배송지의 운영 거래 상태를 변경합니다.',
    pathParams: ['customerId', 'id'],
    bodyTemplate: JSON.stringify({
      status: "ACTIVE"
    }, null, 2)
  },

  // ==========================================
  // 4. 기준정보 - 창고 및 로케이션
  // ==========================================
  {
    id: 'create-warehouse',
    name: '창고 신규 등록 (Create Warehouse)',
    method: 'POST',
    path: '/api/warehouses',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '신규 창고 건물을 등록합니다.',
    bodyTemplate: JSON.stringify({
      code: "WH-SOUTH",
      name: "남부 물류 허브",
      phone: "031-123-4567",
      manager: "임창고",
      address: "경기도 용인시 처인구 12",
      description: "메인 냉장/상온 혼합 보관소"
    }, null, 2)
  },
  {
    id: 'get-warehouse',
    name: '창고 단건 조회 (Get Warehouse)',
    method: 'GET',
    path: '/api/warehouses/{id}',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '창고 고유 ID를 이용해 창고 마스터 내역을 조회합니다.',
    pathParams: ['id']
  },
  {
    id: 'list-warehouses',
    name: '창고 목록 검색 조회 (List Warehouses)',
    method: 'GET',
    path: '/api/warehouses',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '전체 보관 창고 목록을 키워드 및 상태별로 조회합니다.',
    queryParams: [
      { key: 'keyword', label: '검색 키워드 (코드/명)', placeholder: 'SOUTH' },
      { key: 'status', label: '상태 (ACTIVE/INACTIVE)', placeholder: 'ACTIVE' },
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'update-warehouse',
    name: '창고 정보 수정 (Update Warehouse)',
    method: 'PUT',
    path: '/api/warehouses/{id}',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '창고 연락처, 담당자, 주소 정보를 수정합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      name: "남부 제1 물류 허브",
      phone: "031-123-9999",
      manager: "임창고 실장",
      address: "경기도 용인시 처인구 12",
      description: "최신 방역 조치 완료"
    }, null, 2)
  },
  {
    id: 'delete-warehouse',
    name: '창고 삭제 (Delete Warehouse)',
    method: 'DELETE',
    path: '/api/warehouses/{id}',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '창고 정보를 삭제합니다.',
    pathParams: ['id']
  },
  {
    id: 'status-warehouse',
    name: '창고 활성 상태 제어 (Change Warehouse Status)',
    method: 'PUT',
    path: '/api/warehouses/{id}/status',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '창고 입출고 가용 상태를 활성화 또는 정지합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      status: "ACTIVE"
    }, null, 2)
  },
  {
    id: 'create-location',
    name: '적재 로케이션 생성 (Create Location)',
    method: 'POST',
    path: '/api/warehouses/{warehouseId}/locations',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '창고 내부 보관 랙 또는 적재 공간 로케이션 코드를 발행합니다.',
    pathParams: ['warehouseId'],
    bodyTemplate: JSON.stringify({
      code: "A-01-02",
      name: "A구역 1열 2단",
      xAxis: 1,
      yAxis: 1,
      zAxis: 2,
      description: "경량 보관 랙 상층부"
    }, null, 2)
  },
  {
    id: 'list-locations',
    name: '로케이션 목록 조회 (List Locations)',
    method: 'GET',
    path: '/api/warehouses/{warehouseId}/locations',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '창고에 배정된 모든 로케이션의 코드를 페이징 조회합니다.',
    pathParams: ['warehouseId'],
    queryParams: [
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'get-location',
    name: '로케이션 단건 상세 조회 (Get Location)',
    method: 'GET',
    path: '/api/warehouses/{warehouseId}/locations/{id}',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '로케이션 고유 ID로 상세 적재 좌표 및 설명 데이터를 가져옵니다.',
    pathParams: ['warehouseId', 'id']
  },
  {
    id: 'update-location',
    name: '로케이션 수정 (Update Location)',
    method: 'PUT',
    path: '/api/warehouses/{warehouseId}/locations/{id}',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '로케이션의 이름, 좌표, 설명을 변경합니다.',
    pathParams: ['warehouseId', 'id'],
    bodyTemplate: JSON.stringify({
      name: "A구역 1열 2단 수정",
      xAxis: 1,
      yAxis: 2,
      zAxis: 2,
      description: "경량 보관 랙 높이 조절 완료"
    }, null, 2)
  },
  {
    id: 'delete-location',
    name: '로케이션 삭제 (Delete Location)',
    method: 'DELETE',
    path: '/api/warehouses/{warehouseId}/locations/{id}',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '로케이션을 삭제 처리합니다.',
    pathParams: ['warehouseId', 'id']
  },
  {
    id: 'status-location',
    name: '로케이션 가용상태 변경 (Change Location Status)',
    method: 'PUT',
    path: '/api/warehouses/{warehouseId}/locations/{id}/status',
    category: '4. 기준정보 - 창고 및 로케이션',
    description: '로케이션 보관 점유 가능 여부 상태를 변경합니다.',
    pathParams: ['warehouseId', 'id'],
    bodyTemplate: JSON.stringify({
      status: "ACTIVE"
    }, null, 2)
  },

  // ==========================================
  // 5. 기준정보 - 품목, 공급사 및 카테고리
  // ==========================================
  {
    id: 'create-supplier',
    name: '공급사 등록 (Create Supplier)',
    method: 'POST',
    path: '/api/suppliers',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '상품을 납품 공급하는 신규 파트너사를 등록합니다.',
    bodyTemplate: JSON.stringify({
      code: "SUPP-A",
      name: "한국유통산업",
      businessNo: "214-55-12345",
      ceoName: "이공급",
      phone: "031-777-8888",
      email: "supply@korea.com",
      address: "경기도 이천시 대장동 1",
      description: "가공식품 1차 공급 파트너"
    }, null, 2)
  },
  {
    id: 'get-supplier',
    name: '공급사 단건 조회 (Get Supplier)',
    method: 'GET',
    path: '/api/suppliers/{id}',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '공급사의 고유 마스터 데이터를 조회합니다.',
    pathParams: ['id']
  },
  {
    id: 'list-suppliers',
    name: '공급사 검색 목록 조회 (List Suppliers)',
    method: 'GET',
    path: '/api/suppliers',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '공급사 목록을 키워드 및 상태별로 조회합니다.',
    queryParams: [
      { key: 'keyword', label: '공급사코드/명', placeholder: '한국' },
      { key: 'status', label: '상태 (ACTIVE/INACTIVE)', placeholder: 'ACTIVE' },
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'update-supplier',
    name: '공급사 수정 (Update Supplier)',
    method: 'PUT',
    path: '/api/suppliers/{id}',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '공급사의 연락망 및 이메일 주소를 변경합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      name: "한국유통물류",
      businessNo: "214-55-12345",
      ceoName: "이공급",
      phone: "031-777-1234",
      email: "info@koreadist.com",
      address: "경기도 이천시 대장동 1",
      description: "사업자 명칭 물류로 통합 변경"
    }, null, 2)
  },
  {
    id: 'delete-supplier',
    name: '공급사 삭제 (Delete Supplier)',
    method: 'DELETE',
    path: '/api/suppliers/{id}',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '공급사 데이터를 소프트 딜리트 처리합니다.',
    pathParams: ['id']
  },
  {
    id: 'status-supplier',
    name: '공급사 거래 상태 제어 (Change Supplier Status)',
    method: 'PUT',
    path: '/api/suppliers/{id}/status',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '공급업체의 거래 가능 거래 상태를 변경합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      status: "ACTIVE"
    }, null, 2)
  },
  {
    id: 'create-category',
    name: '품목 카테고리 생성 (Create Category)',
    method: 'POST',
    path: '/api/item-categories',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '품목 마스터의 카테고리(분류코드)를 신규 생성합니다.',
    bodyTemplate: JSON.stringify({
      code: "CAT-FOOD",
      name: "신선 보관 식품류",
      description: "유통기한 추적이 필수적인 상온/냉장 식품군"
    }, null, 2)
  },
  {
    id: 'list-categories',
    name: '카테고리 전체 목록 조회 (List Categories)',
    method: 'GET',
    path: '/api/item-categories',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '정의된 품목 분류 카테고리 목록 전체를 가져옵니다.'
  },
  {
    id: 'get-category',
    name: '카테고리 단건 조회 (Get Category)',
    method: 'GET',
    path: '/api/item-categories/{id}',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '카테고리 상세 명세를 확인합니다.',
    pathParams: ['id']
  },
  {
    id: 'update-category',
    name: '카테고리 정보 수정 (Update Category)',
    method: 'PUT',
    path: '/api/item-categories/{id}',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '카테고리의 명칭 및 설명을 갱신합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      name: "신선/냉장 보관 식품류",
      description: "식품안전법 의거 온도 통제 필수 식품군"
    }, null, 2)
  },
  {
    id: 'delete-category',
    name: '카테고리 삭제 (Delete Category)',
    method: 'DELETE',
    path: '/api/item-categories/{id}',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '카테고리 마스터 데이터를 삭제합니다.',
    pathParams: ['id']
  },
  {
    id: 'create-item',
    name: '품목 신규 생성 (Create Item)',
    method: 'POST',
    path: '/api/items',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '보관 및 재고 관리 대상 품목을 마스터 데이터로 등록합니다.',
    bodyTemplate: JSON.stringify({
      code: "ITEM-MILK-1L",
      name: "유기농 우유 1L",
      barcode: "8801122334455",
      supplierId: 1,
      categoryId: 1,
      unit: "EA",
      specification: "1L 카톤팩 / 냉장보관",
      description: "0~5도 보관 유지 요구 품목"
    }, null, 2)
  },
  {
    id: 'get-item',
    name: '품목 단건 상세 조회 (Get Item)',
    method: 'GET',
    path: '/api/items/{id}',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '품목 마스터 및 매핑된 공급사 명세를 조회합니다.',
    pathParams: ['id']
  },
  {
    id: 'list-items',
    name: '품목 목록 검색 조회 (List Items)',
    method: 'GET',
    path: '/api/items',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '다양한 필터 파라미터를 활용해 품목 리스트를 검색합니다.',
    queryParams: [
      { key: 'keyword', label: '검색어 (코드/명/바코드)', placeholder: 'MILK' },
      { key: 'supplierId', label: '공급사 ID', placeholder: '1' },
      { key: 'categoryId', label: '카테고리 ID', placeholder: '1' },
      { key: 'status', label: '상태 (ACTIVE/INACTIVE)', placeholder: 'ACTIVE' },
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'update-item',
    name: '품목 정보 수정 (Update Item)',
    method: 'PUT',
    path: '/api/items/{id}',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '품목의 명칭, 바코드 규격, 단위, 소속 정보 등을 수정합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      name: "유기농 저지방 우유 1L",
      barcode: "8801122334455",
      supplierId: 1,
      categoryId: 1,
      unit: "EA",
      specification: "1L 저지방 카톤팩 / 냉장보관",
      description: "성분 표시 추가 및 스펙 수정"
    }, null, 2)
  },
  {
    id: 'delete-item',
    name: '품목 삭제 (Delete Item)',
    method: 'DELETE',
    path: '/api/items/{id}',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '품목 데이터를 논리적 삭제 처리합니다.',
    pathParams: ['id']
  },
  {
    id: 'status-item',
    name: '품목 사용 여부 상태 제어 (Change Item Status)',
    method: 'PUT',
    path: '/api/items/{id}/status',
    category: '5. 기준정보 - 품목, 공급사 및 카테고리',
    description: '품목 마스터 가용 거래 상태를 활성/정지 변경합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      status: "ACTIVE"
    }, null, 2)
  },

  // ==========================================
  // 6. 물류 트랜잭션 - 입고 및 출고
  // ==========================================
  {
    id: 'create-inbound',
    name: '입고 전표 생성 (Create Inbound)',
    method: 'POST',
    path: '/api/inbounds',
    category: '6. 물류 트랜잭션 - 입고 및 출고',
    description: '공급사 지정 및 입고 디테일 품목 수량을 추가하여 입고 지시서를 발행합니다.',
    bodyTemplate: JSON.stringify({
      supplierId: 1,
      items: [
        {
          itemId: 1,
          locationId: 1,
          quantity: 200
        }
      ],
      description: "남부 허브 정기 입고 건"
    }, null, 2)
  },
  {
    id: 'get-inbound',
    name: '입고 전표 상세 조회 (Get Inbound)',
    method: 'GET',
    path: '/api/inbounds/{id}',
    category: '6. 물류 트랜잭션 - 입고 및 출고',
    description: '입고 지시 전표의 원장 정보와 상세 세부 품목 리스트를 조회합니다.',
    pathParams: ['id']
  },
  {
    id: 'list-inbounds',
    name: '입고 전표 목록 조회 (List Inbounds)',
    method: 'GET',
    path: '/api/inbounds',
    category: '6. 물류 트랜잭션 - 입고 및 출고',
    description: '요청된 모든 입고 지시서 목록을 필터 검색합니다.',
    queryParams: [
      { key: 'supplierId', label: '공급사 ID', placeholder: '1' },
      { key: 'status', label: '입고 상태 (REQUESTED/COMPLETED/CANCELED)', placeholder: 'REQUESTED' },
      { key: 'keyword', label: '입고 번호 (IB-...)', placeholder: 'IB-' },
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'complete-inbound',
    name: '입고 완료 확정 (Complete Inbound)',
    method: 'PUT',
    path: '/api/inbounds/{id}/complete',
    category: '6. 물류 트랜잭션 - 입고 및 출고',
    description: '현장 실사가 완료된 입고 건을 최종 완료 처리하고, 해당 로케이션의 실재고량을 증가시킵니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      description: "물품 무결성 확인 및 입고 적재 완료 확정"
    }, null, 2)
  },
  {
    id: 'cancel-inbound',
    name: '입고 요청 취소 (Cancel Inbound)',
    method: 'PUT',
    path: '/api/inbounds/{id}/cancel',
    category: '6. 물류 트랜잭션 - 입고 및 출고',
    description: '요청 대기 상태의 입고 건을 취소 폐기 처리합니다.',
    pathParams: ['id']
  },
  {
    id: 'create-outbound',
    name: '출고 전표 생성 (Create Outbound)',
    method: 'POST',
    path: '/api/outbounds',
    category: '6. 물류 트랜잭션 - 입고 및 출고',
    description: '고객사와 배송지 정보를 매핑하여 출고 지시서를 신규 등록하고 가용 수량 예약을 잡습니다.',
    bodyTemplate: JSON.stringify({
      customerId: 1,
      deliveryAddressId: 1,
      items: [
        {
          itemId: 1,
          locationId: 1,
          quantity: 50
        }
      ],
      description: "마트 정기 출하 지시 건"
    }, null, 2)
  },
  {
    id: 'get-outbound',
    name: '출고 전표 상세 조회 (Get Outbound)',
    method: 'GET',
    path: '/api/outbounds/{id}',
    category: '6. 물류 트랜잭션 - 입고 및 출고',
    description: '출고 원장 내역 및 출고 지시 상세 항목 리스트를 봅니다.',
    pathParams: ['id']
  },
  {
    id: 'list-outbounds',
    name: '출고 전표 목록 조회 (List Outbounds)',
    method: 'GET',
    path: '/api/outbounds',
    category: '6. 물류 트랜잭션 - 입고 및 출고',
    description: '출고 지시 목록을 필터 검색합니다.',
    queryParams: [
      { key: 'customerId', label: '고객사 ID', placeholder: '1' },
      { key: 'status', label: '출고 상태 (REQUESTED/COMPLETED/CANCELED)', placeholder: 'REQUESTED' },
      { key: 'keyword', label: '출고 번호 (OB-...)', placeholder: 'OB-' },
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'complete-outbound',
    name: '출고 확정 완료 (Complete Outbound)',
    method: 'PUT',
    path: '/api/outbounds/{id}/complete',
    category: '6. 물류 트랜잭션 - 입고 및 출고',
    description: '출고 적재 상차가 완료된 지시 전표를 완료 확정하고, 예약량 해제 및 실재고 차감을 단행합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      description: "배송 차량 출항 및 출고 처리 완료"
    }, null, 2)
  },
  {
    id: 'cancel-outbound',
    name: '출고 취소 (Cancel Outbound)',
    method: 'PUT',
    path: '/api/outbounds/{id}/cancel',
    category: '6. 물류 트랜잭션 - 입고 및 출고',
    description: '출고 지시서를 취소하고, 잡혀있던 재고 예약을 원복 해제합니다.',
    pathParams: ['id']
  },

  // ==========================================
  // 7. 물류 트랜잭션 - 재고, 이송 및 이력
  // ==========================================
  {
    id: 'get-inventory',
    name: '재고 단건 상세조회 (Get Inventory)',
    method: 'GET',
    path: '/api/inventories/{id}',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '재고 고유 식별자로 특정 로케이션 내 품목 재고 수량 정보를 자세히 조회합니다.',
    pathParams: ['id']
  },
  {
    id: 'list-inventories',
    name: '실시간 재고 목록 조회 (List Inventories)',
    method: 'GET',
    path: '/api/inventories',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '창고, 위치, 품목별 필터링을 통해 보관 중인 실재고, 예약 재고, 가용 재고 현황을 파악합니다.',
    queryParams: [
      { key: 'warehouseId', label: '창고 ID', placeholder: '1' },
      { key: 'locationId', label: '로케이션 ID', placeholder: '1' },
      { key: 'itemId', label: '품목 ID', placeholder: '1' },
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'adjust-inventory',
    name: '수동 재고 조정 (Adjust Inventory)',
    method: 'PUT',
    path: '/api/inventories/{id}/adjust',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '실사 조사 차이 등의 사유로 재고 수량을 강제 보정 조절합니다. (낙관적 락 탑재)',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      quantity: 120,
      reason: "랙 실사 수량 보정"
    }, null, 2)
  },
  {
    id: 'reserve-inventory',
    name: '재고 가예약 설정 (Reserve Inventory)',
    method: 'PUT',
    path: '/api/inventories/{id}/reserve',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '테스트용으로 특정 재고 항목의 예약 수량(`reservedQuantity`)을 수동으로 증가시킵니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      quantity: 10
    }, null, 2)
  },
  {
    id: 'release-inventory',
    name: '재고 가예약 해제 (Release Inventory)',
    method: 'PUT',
    path: '/api/inventories/{id}/release',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '설정되어 있던 가예약 수량을 수동으로 경감 원복합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      quantity: 10
    }, null, 2)
  },
  {
    id: 'create-movement',
    name: '재고 이동 이송 요청 (Create Stock Movement)',
    method: 'POST',
    path: '/api/movements',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '창고 내부 로케이션 간 재고 이송 작업 계획서를 등록하고 출발지에 예약을 설정합니다.',
    bodyTemplate: JSON.stringify({
      items: [
        {
          itemId: 1,
          fromLocationId: 1,
          toLocationId: 2,
          quantity: 30
        }
      ],
      description: "로케이션 통폐합 재고 적재위치 변경"
    }, null, 2)
  },
  {
    id: 'get-movement',
    name: '재고 이동 상세 조회 (Get Stock Movement)',
    method: 'GET',
    path: '/api/movements/{id}',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '재고 이송 지시 전표 원장 및 이동 대상 품목 리스트를 조회합니다.',
    pathParams: ['id']
  },
  {
    id: 'list-movements',
    name: '재고 이동 목록 조회 (List Stock Movements)',
    method: 'GET',
    path: '/api/movements',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '작업 상태 및 키워드 조건별로 재고 이송 리스트를 가져옵니다.',
    queryParams: [
      { key: 'status', label: '이동상태 (REQUESTED/COMPLETED/CANCELED)', placeholder: 'REQUESTED' },
      { key: 'keyword', label: '이동번호 (MV-...)', placeholder: 'MV-' },
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  },
  {
    id: 'complete-movement',
    name: '재고 이동 완료 승인 (Complete Stock Movement)',
    method: 'PUT',
    path: '/api/movements/{id}/complete',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '현장 이송 및 적재 배치가 끝난 전표를 최종 승인하여 재고 이동을 데이터베이스에 반영 완료합니다.',
    pathParams: ['id'],
    bodyTemplate: JSON.stringify({
      description: "적재 완료 확인"
    }, null, 2)
  },
  {
    id: 'cancel-movement',
    name: '재고 이동 취소 (Cancel Stock Movement)',
    method: 'PUT',
    path: '/api/movements/{id}/cancel',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '이송 지시를 취소하고 출발지 예약 재고를 복구 해제합니다.',
    pathParams: ['id']
  },
  {
    id: 'get-history',
    name: '재고 변동 이력 단건 조회 (Get Stock History)',
    method: 'GET',
    path: '/api/stock-histories/{id}',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '고유 이력 로그 식별자로 재고 증감 상세 로그를 조회합니다.',
    pathParams: ['id']
  },
  {
    id: 'list-histories',
    name: '재고 변동 이력 전체 조회 (List Stock Histories)',
    method: 'GET',
    path: '/api/stock-histories',
    category: '7. 물류 트랜잭션 - 재고, 이송 및 이력',
    description: '품목, 위치, 작업 유형별로 기록된 시스템 재고 변동 이력을 페이징하여 상세 분석합니다.',
    queryParams: [
      { key: 'itemId', label: '품목 ID', placeholder: '1' },
      { key: 'locationId', label: '로케이션 ID', placeholder: '1' },
      { key: 'historyType', label: '변경 유형 (INBOUND/OUTBOUND/ADJUSTMENT 등)', placeholder: 'INBOUND' },
      { key: 'referenceNo', label: '참조 번호', placeholder: 'IB-' },
      { key: 'page', label: '페이지 번호', placeholder: '0', defaultValue: '0' },
      { key: 'size', label: '페이지 크기', placeholder: '10', defaultValue: '10' }
    ]
  }
];
