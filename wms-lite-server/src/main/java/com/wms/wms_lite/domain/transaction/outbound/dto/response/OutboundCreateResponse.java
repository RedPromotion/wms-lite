package com.wms.wms_lite.domain.transaction.outbound.dto.response;

import com.wms.wms_lite.domain.transaction.outbound.entity.Outbound;
import com.wms.wms_lite.domain.transaction.outbound.enums.OutboundStatus;
import java.time.LocalDateTime;

public record OutboundCreateResponse(
        Long id,
        String outboundNo,
        OutboundStatus status,
        LocalDateTime createdAt
) {
    public static OutboundCreateResponse from(Outbound outbound) {
        return new OutboundCreateResponse(
                outbound.getId(),
                outbound.getOutboundNo(),
                outbound.getStatus(),
                outbound.getCreatedAt()
        );
    }
}
