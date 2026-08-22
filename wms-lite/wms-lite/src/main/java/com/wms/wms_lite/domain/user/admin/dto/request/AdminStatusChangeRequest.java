package com.wms.wms_lite.domain.user.admin.dto.request;

import com.wms.wms_lite.domain.user.enums.AccountStatus;
import jakarta.validation.constraints.NotNull;

public record AdminStatusChangeRequest(@NotNull AccountStatus status) {}
