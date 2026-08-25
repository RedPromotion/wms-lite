package com.wms.wms_lite.domain.master.warehouse.dto.response;

import com.wms.wms_lite.domain.master.warehouse.entity.Warehouse;
import com.wms.wms_lite.domain.master.warehouse.enums.WarehouseStatus;

public record WarehouseSummaryResponse(
        Long id,
        String code,
        String name,
        WarehouseStatus status) {
    public static WarehouseSummaryResponse from(Warehouse w) {
        return new WarehouseSummaryResponse(w.getId(), w.getCode(), w.getName(), w.getStatus());
    }
}
