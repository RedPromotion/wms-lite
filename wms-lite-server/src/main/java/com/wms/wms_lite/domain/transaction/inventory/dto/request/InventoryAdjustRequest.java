package com.wms.wms_lite.domain.transaction.inventory.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryAdjustRequest(
        @NotNull(message = "조정 수량은 필수입니다.")
        @Min(value = 0, message = "조정 수량은 0 이상이어야 합니다.")
        Integer quantity,

        String reason
) {}
