package com.wms.wms_lite.domain.transaction.inventory.dto.response;

import com.wms.wms_lite.domain.transaction.inventory.entity.Inventory;

public record InventorySummaryResponse(
        Long id,
        Long locationId,
        String warehouseName,
        String locationCode,
        String itemCode,
        String itemName,
        Integer quantity,
        Integer allocatedQuantity,
        Integer availableQuantity,
        Integer safetyStockQuantity
) {
    public static InventorySummaryResponse from(Inventory inventory) {
        int reserved = inventory.getReservedQuantity() != null ? inventory.getReservedQuantity() : 0;
        int qty = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int avail = qty - reserved;
        String whName = (inventory.getLocation() != null && inventory.getLocation().getWarehouse() != null)
                ? inventory.getLocation().getWarehouse().getName() : "메인 중앙 물류창고";
        Integer safetyStock = inventory.getItem() != null ? inventory.getItem().getSafetyStockQuantity() : null;

        return new InventorySummaryResponse(
                inventory.getId(),
                inventory.getLocation() != null ? inventory.getLocation().getId() : null,
                whName,
                inventory.getLocation() != null ? inventory.getLocation().getCode() : "LOC-A-101",
                inventory.getItem() != null ? inventory.getItem().getCode() : "ITM-001",
                inventory.getItem() != null ? inventory.getItem().getName() : "품목명 미지정",
                qty,
                reserved,
                avail > 0 ? avail : 0,
                safetyStock
        );
    }
}
