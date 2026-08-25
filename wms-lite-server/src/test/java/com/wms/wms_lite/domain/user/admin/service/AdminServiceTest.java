package com.wms.wms_lite.domain.user.admin.service;

import com.wms.wms_lite.domain.user.admin.dto.request.AdminCreateRequest;
import com.wms.wms_lite.domain.user.admin.dto.request.AdminPasswordChangeRequest;
import com.wms.wms_lite.domain.user.admin.dto.response.AdminCreateResponse;
import com.wms.wms_lite.domain.user.admin.entity.Admin;
import com.wms.wms_lite.domain.user.admin.exception.AdminErrorCode;
import com.wms.wms_lite.domain.user.admin.exception.AdminException;
import com.wms.wms_lite.domain.user.admin.repository.AdminRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * [운영 관리자 인증/권한 단위 테스트 (AdminServiceTest)]
 *
 * 주요 검증 항목:
 * 1. registerAdmin: 플랫폼 관리자 계정 생성 및 권한 부여 검증
 * 2. loginAdmin: 관리자 로그인 및 무상태(Stateless) JWT 토큰 생성 검증
 * 3. updateAdminStatus: 관리자에 의한 계정 상태 변경(ACTIVE/INACTIVE/LOCKED) 처리 검증
 */
@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    @Test
    @DisplayName("관리자 생성 성공 - 비밀번호가 암호화되어 생성된다")
    void createAdmin_success() {
        // given
        AdminCreateRequest request = new AdminCreateRequest(
                "admin1",
                "adminPassword123!",
                "최고관리자",
                "010-9999-9999",
                "admin1@wms.com"
        );

        given(adminRepository.existsByLoginId("admin1")).willReturn(false);
        given(adminRepository.existsByEmail("admin1@wms.com")).willReturn(false);
        given(passwordEncoder.encode("adminPassword123!")).willReturn("$2a$10$EncryptedAdminPassword");
        given(adminRepository.save(any(Admin.class))).willAnswer(invocation -> {
            Admin admin = invocation.getArgument(0);
            ReflectionTestUtils.setField(admin, "id", 1L);
            return admin;
        });

        // when
        AdminCreateResponse response = adminService.createAdmin(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.loginId()).isEqualTo("admin1");
        verify(passwordEncoder).encode("adminPassword123!");
        verify(adminRepository).save(any(Admin.class));
    }

    @Test
    @DisplayName("관리자 생성 실패 - 이미 사용 중인 로그인 아이디 요청 시 예외가 발생한다")
    void createAdmin_duplicatedLoginId() {
        // given
        AdminCreateRequest request = new AdminCreateRequest(
                "admin1", "pass", "관리자", "010-0000-0000", "admin@wms.com"
        );
        given(adminRepository.existsByLoginId("admin1")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> adminService.createAdmin(request))
                .isInstanceOf(AdminException.class)
                .hasMessageContaining(AdminErrorCode.ADMIN_LOGIN_ID_DUPLICATED.getMessage());
    }

    @Test
    @DisplayName("관리자 비밀번호 변경 실패 - 현재 비밀번호가 틀린 경우 ADMIN_PASSWORD_INVALID 예외가 발생한다")
    void changePassword_invalidCurrentPassword() {
        // given
        Long adminId = 1L;
        Admin admin = new Admin();
        admin.setPassword("$2a$10$CurrentEncryptedAdminPassword");
        given(adminRepository.findById(adminId)).willReturn(Optional.of(admin));

        given(passwordEncoder.matches("wrongPass", "$2a$10$CurrentEncryptedAdminPassword")).willReturn(false);

        AdminPasswordChangeRequest request = new AdminPasswordChangeRequest("wrongPass", "newPass123!");

        // when & then
        assertThatThrownBy(() -> adminService.changePassword(adminId, request))
                .isInstanceOf(AdminException.class)
                .hasMessageContaining(AdminErrorCode.ADMIN_PASSWORD_INVALID.getMessage());
    }
}
