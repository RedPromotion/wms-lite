package com.wms.wms_lite.domain.transaction.inbound.dto.response;

import com.wms.wms_lite.domain.transaction.inbound.entity.Inbound;
import com.wms.wms_lite.domain.transaction.inbound.enums.InboundStatus;
import java.time.LocalDateTime;
import java.util.List;

public record InboundResponse(
        Long id,
        String inboundNo,
        String supplierCode,
        String supplierName,
        InboundStatus status,
        List<InboundItemResponse> items,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static InboundResponse from(Inbound inbound) {
        List<InboundItemResponse> itemResponses = inbound.getItems().stream()
                .map(InboundItemResponse::from)
                .toList();

        return new InboundResponse(
                inbound.getId(),
                inbound.getInboundNo(),
                inbound.getSupplier() != null ? inbound.getSupplier().getCode() : null,
                inbound.getSupplier() != null ? inbound.getSupplier().getName() : null,
                inbound.getStatus(),
                itemResponses,
                inbound.getCompletedAt(),
                inbound.getCreatedAt(),
                inbound.getUpdatedAt()
        );
    }
}
