package com.wms.wms_lite.domain.master.item.dto.response;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.enums.ItemStatus;
import com.wms.wms_lite.domain.master.item.enums.UnitType;
import java.time.LocalDateTime;

public record ItemResponse(
        Long id,
        String code,
        String name,
        String barcode,
        String specification,
        String description,
        String supplierName,
        String categoryName,
        UnitType unit,
        ItemStatus status,
        Integer safetyStockQuantity,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ItemResponse from(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getCode(),
                item.getName(),
                item.getBarcode(),
                item.getSpecification(),
                item.getDescription(),
                item.getSupplier() != null ? item.getSupplier().getName() : null,
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getUnit(),
                item.getStatus(),
                item.getSafetyStockQuantity(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
