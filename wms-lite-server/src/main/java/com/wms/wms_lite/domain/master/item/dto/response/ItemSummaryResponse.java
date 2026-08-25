package com.wms.wms_lite.domain.master.item.dto.response;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.enums.ItemStatus;
import com.wms.wms_lite.domain.master.item.enums.UnitType;

public record ItemSummaryResponse(
        Long id,
        String code,
        String name,
        String supplierName,
        String categoryName,
        UnitType unit,
        ItemStatus status,
        Integer safetyStockQuantity
) {
    public static ItemSummaryResponse from(Item item) {
        return new ItemSummaryResponse(
                item.getId(),
                item.getCode(),
                item.getName(),
                item.getSupplier() != null ? item.getSupplier().getName() : null,
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getUnit(),
                item.getStatus(),
                item.getSafetyStockQuantity()
        );
    }
}
