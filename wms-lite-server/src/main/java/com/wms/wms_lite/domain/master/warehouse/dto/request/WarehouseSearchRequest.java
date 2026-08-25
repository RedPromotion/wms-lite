package com.wms.wms_lite.domain.master.warehouse.dto.request;

import com.wms.wms_lite.domain.master.warehouse.enums.WarehouseStatus;

public record WarehouseSearchRequest(
        String keyword,
        WarehouseStatus status
) {}
