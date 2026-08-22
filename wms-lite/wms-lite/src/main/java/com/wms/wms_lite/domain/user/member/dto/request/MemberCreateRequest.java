package com.wms.wms_lite.domain.user.member.dto.request;

import com.wms.wms_lite.domain.user.member.enums.Department;
import com.wms.wms_lite.domain.user.member.enums.MemberRole;
import com.wms.wms_lite.global.annotation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record MemberCreateRequest(
        @NotBlank String loginId,
        @NotBlank @ValidPassword String password,
        @NotBlank String name,
        String phone,
        @Email @NotBlank String email,
        Department department,
        MemberRole role
) {}
