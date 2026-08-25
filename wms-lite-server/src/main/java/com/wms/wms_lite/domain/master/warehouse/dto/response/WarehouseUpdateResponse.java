package com.wms.wms_lite.domain.master.warehouse.dto.response;

import com.wms.wms_lite.domain.master.warehouse.entity.Warehouse;
import java.time.LocalDateTime;

public record WarehouseUpdateResponse(
        Long id,
        String name,
        LocalDateTime updatedAt
) {
    public static WarehouseUpdateResponse from(Warehouse w) {
        return new WarehouseUpdateResponse(w.getId(), w.getName(), w.getUpdatedAt());
    }
}
