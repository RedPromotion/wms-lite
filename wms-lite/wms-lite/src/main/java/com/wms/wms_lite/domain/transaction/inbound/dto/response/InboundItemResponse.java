package com.wms.wms_lite.domain.transaction.inbound.dto.response;

import com.wms.wms_lite.domain.transaction.inbound.entity.InboundItem;

public record InboundItemResponse(
        Long itemId,
        String itemCode,
        String itemName,
        String locationCode,
        String locationName,
        Integer quantity
) {
    public static InboundItemResponse from(InboundItem inboundItem) {
        return new InboundItemResponse(
                inboundItem.getItem() != null ? inboundItem.getItem().getId() : null,
                inboundItem.getItem() != null ? inboundItem.getItem().getCode() : null,
                inboundItem.getItem() != null ? inboundItem.getItem().getName() : null,
                inboundItem.getLocation() != null ? inboundItem.getLocation().getCode() : null,
                inboundItem.getLocation() != null ? inboundItem.getLocation().getName() : null,
                inboundItem.getQuantity()
        );
    }
}
