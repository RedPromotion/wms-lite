package com.wms.wms_lite.domain.transaction.inbound.dto.response;

import com.wms.wms_lite.domain.transaction.inbound.entity.Inbound;
import com.wms.wms_lite.domain.transaction.inbound.enums.InboundStatus;
import java.time.LocalDateTime;

public record InboundSummaryResponse(
                Long id,
                String inboundNo,
                String supplierName,
                InboundStatus status,
                Integer itemCount,
                Integer totalQuantity,
                LocalDateTime createdAt) {
        public static InboundSummaryResponse from(Inbound inbound) {
                int count = inbound.getItems() != null ? inbound.getItems().size() : 0;
                int totalQty = inbound.getItems() != null
                                ? inbound.getItems().stream()
                                                .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                                                .sum()
                                : 0;

                return new InboundSummaryResponse(
                                inbound.getId(),
                                inbound.getInboundNo(),
                                inbound.getSupplier() != null ? inbound.getSupplier().getName() : "공급업체 미지정",
                                inbound.getStatus(),
                                count,
                                totalQty,
                                inbound.getCreatedAt());
        }
}
