package com.wms.wms_lite.domain.transaction.stockmovement.dto.response;

import com.wms.wms_lite.domain.transaction.stockmovement.entity.StockMovementItem;

public record MovementItemResponse(
        Long itemId,
        String itemCode,
        String itemName,
        String fromLocationCode,
        String toLocationCode,
        Integer quantity
) {
    public static MovementItemResponse from(StockMovementItem item) {
        return new MovementItemResponse(
                item.getItem() != null ? item.getItem().getId() : null,
                item.getItem() != null ? item.getItem().getCode() : null,
                item.getItem() != null ? item.getItem().getName() : null,
                item.getFromLocation() != null ? item.getFromLocation().getCode() : null,
                item.getToLocation() != null ? item.getToLocation().getCode() : null,
                item.getQuantity()
        );
    }
}
