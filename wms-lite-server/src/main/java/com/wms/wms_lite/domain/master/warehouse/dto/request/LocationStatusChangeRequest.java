package com.wms.wms_lite.domain.master.warehouse.dto.request;

import com.wms.wms_lite.domain.master.warehouse.enums.LocationStatus;
import jakarta.validation.constraints.NotNull;

public record LocationStatusChangeRequest(
        @NotNull(message = "로케이션 상태값은 필수입니다.")
        LocationStatus status
) {}
