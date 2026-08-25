package com.wms.wms_lite.domain.user.member.dto.request;

import com.wms.wms_lite.domain.user.enums.AccountStatus;
import jakarta.validation.constraints.NotNull;

public record MemberStatusChangeRequest(@NotNull AccountStatus status) {}
