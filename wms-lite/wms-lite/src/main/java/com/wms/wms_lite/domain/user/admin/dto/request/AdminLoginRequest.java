package com.wms.wms_lite.domain.user.admin.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequest(@NotBlank String loginId, @NotBlank String password) {}
