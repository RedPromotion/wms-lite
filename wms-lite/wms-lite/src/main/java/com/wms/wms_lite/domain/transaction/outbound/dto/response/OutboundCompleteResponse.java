package com.wms.wms_lite.domain.transaction.outbound.dto.response;

import com.wms.wms_lite.domain.transaction.outbound.entity.Outbound;
import com.wms.wms_lite.domain.transaction.outbound.enums.OutboundStatus;
import java.time.LocalDateTime;

public record OutboundCompleteResponse(
        Long id,
        String outboundNo,
        OutboundStatus status,
        LocalDateTime completedAt
) {
    public static OutboundCompleteResponse from(Outbound outbound) {
        return new OutboundCompleteResponse(
                outbound.getId(),
                outbound.getOutboundNo(),
                outbound.getStatus(),
                outbound.getCompletedAt()
        );
    }
}
