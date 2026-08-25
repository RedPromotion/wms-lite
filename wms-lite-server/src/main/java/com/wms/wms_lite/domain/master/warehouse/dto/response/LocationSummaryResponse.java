package com.wms.wms_lite.domain.master.warehouse.dto.response;

import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.master.warehouse.enums.LocationStatus;

public record LocationSummaryResponse(
        Long id,
        String code,
        String name,
        LocationStatus status
) {
    public static LocationSummaryResponse from(Location l) {
        return new LocationSummaryResponse(
                l.getId(),
                l.getCode(),
                l.getName(),
                l.getStatus()
        );
    }
}
