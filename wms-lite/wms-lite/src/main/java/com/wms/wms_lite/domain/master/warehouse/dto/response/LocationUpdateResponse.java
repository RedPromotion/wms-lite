package com.wms.wms_lite.domain.master.warehouse.dto.response;

import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import java.time.LocalDateTime;

public record LocationUpdateResponse(
        Long id,
        String name,
        LocalDateTime updatedAt
) {
    public static LocationUpdateResponse from(Location l) {
        return new LocationUpdateResponse(l.getId(), l.getName(), l.getUpdatedAt());
    }
}
