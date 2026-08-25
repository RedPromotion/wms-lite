package com.wms.wms_lite.domain.user.member.dto.request;

import com.wms.wms_lite.global.annotation.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public record MemberPasswordChangeRequest(
        @NotBlank String currentPassword,
        @NotBlank @ValidPassword String newPassword
) {}
