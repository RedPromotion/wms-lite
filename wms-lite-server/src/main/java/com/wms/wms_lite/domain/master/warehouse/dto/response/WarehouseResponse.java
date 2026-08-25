package com.wms.wms_lite.domain.master.warehouse.dto.response;

import com.wms.wms_lite.domain.master.warehouse.entity.Warehouse;
import com.wms.wms_lite.domain.master.warehouse.enums.WarehouseStatus;
import java.time.LocalDateTime;

public record WarehouseResponse(
        Long id,
        String code,
        String name,
        String phone,
        String manager,
        String address,
        WarehouseStatus status,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static WarehouseResponse from(Warehouse w) {
        return new WarehouseResponse(
                w.getId(),
                w.getCode(),
                w.getName(),
                w.getPhone(),
                w.getManager(),
                w.getAddress(),
                w.getStatus(),
                w.getDescription(),
                w.getCreatedAt(),
                w.getUpdatedAt()
        );
    }
}
