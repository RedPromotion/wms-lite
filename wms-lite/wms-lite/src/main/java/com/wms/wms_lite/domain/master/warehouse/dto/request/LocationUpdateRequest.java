package com.wms.wms_lite.domain.master.warehouse.dto.request;

public record LocationUpdateRequest(
        String name,
        Integer xAxis,
        Integer yAxis,
        Integer zAxis,
        String description
) {}
