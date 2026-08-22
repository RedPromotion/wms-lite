package com.wms.wms_lite.domain.user.admin.dto.response;

import com.wms.wms_lite.domain.user.admin.entity.Admin;
import com.wms.wms_lite.domain.user.admin.enums.AdminRole;
import com.wms.wms_lite.domain.user.enums.AccountStatus;

public record AdminSummaryResponse(Long id, String loginId, String name, AdminRole role, AccountStatus status) { public static AdminSummaryResponse from(Admin admin){ return new AdminSummaryResponse(admin.getId(), admin.getLoginId(), admin.getName(), admin.getRole(), admin.getStatus()); } }
