package com.wms.wms_lite.domain.master.warehouse.dto.response;

import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.master.warehouse.enums.LocationStatus;
import java.time.LocalDateTime;

public record LocationResponse(
        Long id,
        String code,
        String name,
        Integer xAxis,
        Integer yAxis,
        Integer zAxis,
        LocationStatus status,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static LocationResponse from(Location l) {
        return new LocationResponse(
                l.getId(),
                l.getCode(),
                l.getName(),
                l.getXAxis(),
                l.getYAxis(),
                l.getZAxis(),
                l.getStatus(),
                l.getDescription(),
                l.getCreatedAt(),
                l.getUpdatedAt()
        );
    }
}
