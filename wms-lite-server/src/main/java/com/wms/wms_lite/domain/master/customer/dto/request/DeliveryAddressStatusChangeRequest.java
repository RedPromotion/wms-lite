package com.wms.wms_lite.domain.master.customer.dto.request;

import com.wms.wms_lite.domain.master.customer.enums.DeliveryAddressStatus;
import jakarta.validation.constraints.NotNull;

public record DeliveryAddressStatusChangeRequest(
        @NotNull(message = "배송지 상태는 필수입니다.")
        DeliveryAddressStatus status
) {}
