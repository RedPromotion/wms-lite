package com.wms.wms_lite.domain.user.admin.dto.request;

import com.wms.wms_lite.global.annotation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminCreateRequest(
        @NotBlank String loginId,
        @NotBlank @ValidPassword String password,
        @NotBlank String name,
        String phone,
        @Email @NotBlank String email
) {}
