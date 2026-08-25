package com.wms.wms_lite.domain.transaction.inventory.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryReleaseRequest(
        @NotNull(message = "예약 해제 수량은 필수입니다.")
        @Min(value = 1, message = "예약 해제 수량은 1 이상이어야 합니다.")
        Integer quantity
) {}
