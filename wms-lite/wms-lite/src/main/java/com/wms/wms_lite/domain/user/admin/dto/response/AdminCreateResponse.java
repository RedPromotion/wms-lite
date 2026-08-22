package com.wms.wms_lite.domain.user.admin.dto.response;

import com.wms.wms_lite.domain.user.admin.entity.Admin;
import com.wms.wms_lite.domain.user.admin.enums.AdminRole;
import java.time.LocalDateTime;

public record AdminCreateResponse(Long id, String loginId, String name, AdminRole role, LocalDateTime createdAt) { public static AdminCreateResponse from(Admin admin){ return new AdminCreateResponse(admin.getId(), admin.getLoginId(), admin.getName(), admin.getRole(), admin.getCreatedAt()); } }
