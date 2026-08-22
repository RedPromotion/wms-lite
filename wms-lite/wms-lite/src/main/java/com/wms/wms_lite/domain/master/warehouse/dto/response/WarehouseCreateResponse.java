package com.wms.wms_lite.domain.master.warehouse.dto.response;

import com.wms.wms_lite.domain.master.warehouse.entity.Warehouse;
import java.time.LocalDateTime;

public record WarehouseCreateResponse(
        Long id,
        String code,
        String name,
        LocalDateTime createdAt
) {
    public static WarehouseCreateResponse from(Warehouse w) {
        return new WarehouseCreateResponse(w.getId(), w.getCode(), w.getName(), w.getCreatedAt());
    }
}
