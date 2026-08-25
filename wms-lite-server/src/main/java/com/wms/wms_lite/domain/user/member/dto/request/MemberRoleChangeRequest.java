package com.wms.wms_lite.domain.user.member.dto.request;

import com.wms.wms_lite.domain.user.member.enums.MemberRole;
import jakarta.validation.constraints.NotNull;

public record MemberRoleChangeRequest(@NotNull MemberRole role) {}
