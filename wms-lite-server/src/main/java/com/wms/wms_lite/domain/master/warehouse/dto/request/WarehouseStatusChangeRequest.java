package com.wms.wms_lite.domain.master.warehouse.dto.request;

import com.wms.wms_lite.domain.master.warehouse.enums.WarehouseStatus;
import jakarta.validation.constraints.NotNull;

public record WarehouseStatusChangeRequest(
        @NotNull WarehouseStatus status
) {
}
