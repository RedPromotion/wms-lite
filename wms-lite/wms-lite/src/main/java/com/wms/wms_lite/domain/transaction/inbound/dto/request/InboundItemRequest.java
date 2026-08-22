package com.wms.wms_lite.domain.transaction.inbound.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InboundItemRequest(
        @NotNull(message = "품목 ID는 필수입니다.")
        Long itemId,

        @NotNull(message = "로케이션 ID는 필수입니다.")
        Long locationId,

        @NotNull(message = "입고 수량은 필수입니다.")
        @Min(value = 1, message = "입고 수량은 1 이상이어야 합니다.")
        Integer quantity
) {}
