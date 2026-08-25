package com.wms.wms_lite.domain.user.admin.dto.response;

import com.wms.wms_lite.domain.user.admin.entity.Admin;
import com.wms.wms_lite.domain.user.admin.enums.AdminRole;
import com.wms.wms_lite.domain.user.enums.AccountStatus;
import java.time.LocalDateTime;

public record AdminResponse(Long id, String loginId, String name, String phone, String email, AdminRole role, AccountStatus status, LocalDateTime lastLoginAt, Integer loginFailCount, Boolean passwordExpired, LocalDateTime createdAt, LocalDateTime updatedAt) {
    public static AdminResponse from(Admin admin) { return new AdminResponse(admin.getId(), admin.getLoginId(), admin.getName(), admin.getPhone(), admin.getEmail(), admin.getRole(), admin.getStatus(), admin.getLastLoginAt(), admin.getLoginFailCount(), admin.getPasswordExpired(), admin.getCreatedAt(), admin.getUpdatedAt()); }
}
