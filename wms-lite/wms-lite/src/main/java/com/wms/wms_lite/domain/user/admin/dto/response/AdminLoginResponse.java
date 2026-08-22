package com.wms.wms_lite.domain.user.admin.dto.response;

import com.wms.wms_lite.domain.user.admin.enums.AdminRole;

public record AdminLoginResponse(Long adminId, String loginId, String name, AdminRole role, String accessToken, String refreshToken) {}
