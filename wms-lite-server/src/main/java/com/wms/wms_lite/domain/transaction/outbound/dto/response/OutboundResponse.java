package com.wms.wms_lite.domain.transaction.outbound.dto.response;

import com.wms.wms_lite.domain.transaction.outbound.entity.Outbound;
import com.wms.wms_lite.domain.transaction.outbound.enums.OutboundStatus;
import java.time.LocalDateTime;
import java.util.List;

public record OutboundResponse(
        Long id,
        String outboundNo,
        String customerCode,
        String customerName,
        String deliveryAddressName,
        OutboundStatus status,
        List<OutboundItemResponse> items,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static OutboundResponse from(Outbound outbound) {
        List<OutboundItemResponse> itemResponses = outbound.getItems().stream()
                .map(OutboundItemResponse::from)
                .toList();

        return new OutboundResponse(
                outbound.getId(),
                outbound.getOutboundNo(),
                outbound.getCustomer() != null ? outbound.getCustomer().getCode() : null,
                outbound.getCustomer() != null ? outbound.getCustomer().getName() : null,
                outbound.getDeliveryAddress() != null ? outbound.getDeliveryAddress().getName() : null,
                outbound.getStatus(),
                itemResponses,
                outbound.getCompletedAt(),
                outbound.getCreatedAt(),
                outbound.getUpdatedAt()
        );
    }
}
