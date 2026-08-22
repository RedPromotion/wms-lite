package com.wms.wms_lite.domain.transaction.outbound.dto.response;

import com.wms.wms_lite.domain.transaction.outbound.entity.OutboundItem;

public record OutboundItemResponse(
        Long itemId,
        String itemCode,
        String itemName,
        String locationCode,
        String locationName,
        Integer quantity
) {
    public static OutboundItemResponse from(OutboundItem outboundItem) {
        return new OutboundItemResponse(
                outboundItem.getItem() != null ? outboundItem.getItem().getId() : null,
                outboundItem.getItem() != null ? outboundItem.getItem().getCode() : null,
                outboundItem.getItem() != null ? outboundItem.getItem().getName() : null,
                outboundItem.getLocation() != null ? outboundItem.getLocation().getCode() : null,
                outboundItem.getLocation() != null ? outboundItem.getLocation().getName() : null,
                outboundItem.getQuantity()
        );
    }
}
