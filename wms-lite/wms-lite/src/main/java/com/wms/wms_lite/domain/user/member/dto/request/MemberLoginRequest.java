package com.wms.wms_lite.domain.user.member.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MemberLoginRequest(@NotBlank String loginId, @NotBlank String password) {}
