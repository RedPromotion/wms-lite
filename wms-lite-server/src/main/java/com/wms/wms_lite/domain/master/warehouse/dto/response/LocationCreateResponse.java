package com.wms.wms_lite.domain.master.warehouse.dto.response;

import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import java.time.LocalDateTime;

public record LocationCreateResponse(
        Long id,
        String code,
        String name,
        LocalDateTime createdAt
) {
    public static LocationCreateResponse from(Location l) {
        return new LocationCreateResponse(
                l.getId(),
                l.getCode(),
                l.getName(),
                l.getCreatedAt()
        );
    }
}
