package com.wms.wms_lite.domain.transaction.inventory.dto.response;

import com.wms.wms_lite.domain.transaction.inventory.entity.Inventory;
import java.time.LocalDateTime;

public record InventoryResponse(
        Long id,
        String warehouseCode,
        String warehouseName,
        String locationCode,
        String locationName,
        String itemCode,
        String itemName,
        Integer quantity,
        Integer reservedQuantity,
        Integer availableQuantity,
        LocalDateTime updatedAt
) {
    public static InventoryResponse from(Inventory inventory) {
        int avail = inventory.getQuantity() - inventory.getReservedQuantity();
        return new InventoryResponse(
                inventory.getId(),
                inventory.getLocation() != null && inventory.getLocation().getWarehouse() != null ? inventory.getLocation().getWarehouse().getCode() : null,
                inventory.getLocation() != null && inventory.getLocation().getWarehouse() != null ? inventory.getLocation().getWarehouse().getName() : null,
                inventory.getLocation() != null ? inventory.getLocation().getCode() : null,
                inventory.getLocation() != null ? inventory.getLocation().getName() : null,
                inventory.getItem() != null ? inventory.getItem().getCode() : null,
                inventory.getItem() != null ? inventory.getItem().getName() : null,
                inventory.getQuantity(),
                inventory.getReservedQuantity(),
                avail,
                inventory.getUpdatedAt()
        );
    }
}
