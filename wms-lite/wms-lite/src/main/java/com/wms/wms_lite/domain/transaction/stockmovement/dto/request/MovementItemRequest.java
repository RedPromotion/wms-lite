package com.wms.wms_lite.domain.transaction.stockmovement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MovementItemRequest(
        @NotNull(message = "품목 ID는 필수입니다.")
        Long itemId,

        @NotNull(message = "출발 로케이션 ID는 필수입니다.")
        Long fromLocationId,

        @NotNull(message = "도착 로케이션 ID는 필수입니다.")
        Long toLocationId,

        @NotNull(message = "이동 수량은 필수입니다.")
        @Min(value = 1, message = "이동 수량은 1 이상이어야 합니다.")
        Integer quantity
) {}
