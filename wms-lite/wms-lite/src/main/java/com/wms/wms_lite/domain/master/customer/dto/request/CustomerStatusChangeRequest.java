package com.wms.wms_lite.domain.master.customer.dto.request;

import com.wms.wms_lite.domain.master.customer.enums.CustomerStatus;
import jakarta.validation.constraints.NotNull;

public record CustomerStatusChangeRequest(
        @NotNull(message = "고객 상태는 필수입니다.")
        CustomerStatus status
) {}
