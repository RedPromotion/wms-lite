package com.wms.wms_lite.domain.user.admin.dto.request;

import com.wms.wms_lite.domain.user.admin.enums.AdminRole;
import jakarta.validation.constraints.NotNull;

public record AdminRoleChangeRequest(@NotNull AdminRole role) {}
