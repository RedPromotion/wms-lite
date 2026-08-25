package com.wms.wms_lite.domain.transaction.inventory.dto.request;

public record InventorySearchRequest(
        Long warehouseId,
        Long locationId,
        Long itemId,
        String keyword
) {}
