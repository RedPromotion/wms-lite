package com.wms.wms_lite.domain.transaction.inventory.dto.response;

import com.wms.wms_lite.domain.transaction.inventory.entity.Inventory;
import java.time.LocalDateTime;

public record InventoryAdjustResponse(
        Long id,
        Integer quantity,
        Integer availableQuantity,
        LocalDateTime updatedAt
) {
    public static InventoryAdjustResponse from(Inventory inventory) {
        int avail = inventory.getQuantity() - inventory.getReservedQuantity();
        return new InventoryAdjustResponse(
                inventory.getId(),
                inventory.getQuantity(),
                avail,
                inventory.getUpdatedAt()
        );
    }
}
