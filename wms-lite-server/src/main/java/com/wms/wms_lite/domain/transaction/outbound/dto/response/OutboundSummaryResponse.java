package com.wms.wms_lite.domain.transaction.outbound.dto.response;

import com.wms.wms_lite.domain.transaction.outbound.entity.Outbound;
import com.wms.wms_lite.domain.transaction.outbound.enums.OutboundStatus;
import java.time.LocalDateTime;

public record OutboundSummaryResponse(
                Long id,
                String outboundNo,
                String customerName,
                OutboundStatus status,
                Integer itemCount,
                Integer totalQuantity,
                LocalDateTime createdAt) {
        public static OutboundSummaryResponse from(Outbound outbound) {
                int count = outbound.getItems() != null ? outbound.getItems().size() : 0;
                int totalQty = outbound.getItems() != null
                                ? outbound.getItems().stream()
                                                .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                                                .sum()
                                : 0;

                return new OutboundSummaryResponse(
                                outbound.getId(),
                                outbound.getOutboundNo(),
                                outbound.getCustomer() != null ? outbound.getCustomer().getName() : "고객사 미지정",
                                outbound.getStatus(),
                                count,
                                totalQty,
                                outbound.getCreatedAt());
        }
}
