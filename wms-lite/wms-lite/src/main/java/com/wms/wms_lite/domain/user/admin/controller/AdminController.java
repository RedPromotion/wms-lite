package com.wms.wms_lite.domain.user.admin.controller;

import com.wms.wms_lite.domain.user.admin.dto.request.*;
import com.wms.wms_lite.domain.user.admin.dto.response.*;
import com.wms.wms_lite.domain.user.admin.entity.Admin;
import com.wms.wms_lite.domain.user.admin.service.AdminLoginService;
import com.wms.wms_lite.domain.user.admin.service.AdminService;
import com.wms.wms_lite.global.response.PageResponse;
import com.wms.wms_lite.global.util.SecurityUtils;
import com.wms.wms_lite.domain.user.admin.exception.AdminErrorCode;
import com.wms.wms_lite.domain.user.admin.exception.AdminException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.wms.wms_lite.domain.user.member.dto.request.ReissueRequest;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/admins")
public class AdminController {
    private final AdminService adminService;
    private final AdminLoginService adminLoginService;

    @PostMapping("/login")
    public AdminLoginResponse login(@Valid @RequestBody AdminLoginRequest request) {
        return adminLoginService.login(request);
    }

    @PostMapping("/reissue")
    public AdminLoginResponse reissue(@Valid @RequestBody ReissueRequest request) {
        return adminLoginService.reissueAccessToken(request.refreshToken());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout() {
        String loginId = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new AdminException(AdminErrorCode.ADMIN_NOT_FOUND));
        adminLoginService.logout(loginId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV')")
    public AdminCreateResponse createAdmin(@Valid @RequestBody AdminCreateRequest request) {
        return adminService.createAdmin(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public AdminResponse getAdmin(@PathVariable Long id) {
        return adminService.getAdmin(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV')")
    public PageResponse<AdminSummaryResponse> getAdminList(Pageable pageable) {
        return adminService.getAdminList(pageable);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public AdminUpdateResponse updateAdmin(@PathVariable Long id, @Valid @RequestBody AdminUpdateRequest request) {
        validateSelfOrSuper(id);
        return adminService.updateAdmin(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN_SUPER')")
    public void deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
    }

    @PutMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public void changePassword(@PathVariable Long id, @Valid @RequestBody AdminPasswordChangeRequest request) {
        validateSelfOnly(id);
        adminService.changePassword(id, request);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER')")
    public AdminResponse changeRole(@PathVariable Long id, @Valid @RequestBody AdminRoleChangeRequest request) {
        return adminService.changeRole(id, request);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV')")
    public AdminResponse changeStatus(@PathVariable Long id, @Valid @RequestBody AdminStatusChangeRequest request) {
        return adminService.changeStatus(id, request);
    }

    /**
     * 본인 혹은 최고관리자(ADMIN_SUPER) 권한이 있는지 체크
     */
    private void validateSelfOrSuper(Long id) {
        String currentUsername = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new AdminException(AdminErrorCode.ADMIN_PASSWORD_INVALID)); // 권한 없음 예외로 처리 가능하나 템플릿
                                                                                               // 코드 기반

        Admin targetAdmin = adminService.findAdmin(id);

        boolean isSelf = currentUsername.equals(targetAdmin.getLoginId());
        boolean isSuper = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN_SUPER"));

        if (!isSelf && !isSuper) {
            throw new AdminException(AdminErrorCode.ADMIN_PASSWORD_INVALID); // 적절한 비즈니스 권한 없음 에러가 정의되지 않은 경우 예외 반환
        }
    }

    /**
     * 오직 본인(요청 당사자)인지 체크
     */
    private void validateSelfOnly(Long id) {
        String currentUsername = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new AdminException(AdminErrorCode.ADMIN_PASSWORD_INVALID));

        Admin targetAdmin = adminService.findAdmin(id);

        if (!currentUsername.equals(targetAdmin.getLoginId())) {
            throw new AdminException(AdminErrorCode.ADMIN_PASSWORD_INVALID);
        }
    }
}
