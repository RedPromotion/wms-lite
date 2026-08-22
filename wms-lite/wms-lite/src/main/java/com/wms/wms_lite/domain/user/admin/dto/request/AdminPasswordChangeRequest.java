package com.wms.wms_lite.domain.user.admin.dto.request;

import com.wms.wms_lite.global.annotation.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public record AdminPasswordChangeRequest(
        @NotBlank String currentPassword,
        @NotBlank @ValidPassword String newPassword
) {}
