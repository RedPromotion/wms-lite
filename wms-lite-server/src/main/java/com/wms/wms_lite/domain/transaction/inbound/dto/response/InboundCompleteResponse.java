package com.wms.wms_lite.domain.transaction.inbound.dto.response;

import com.wms.wms_lite.domain.transaction.inbound.entity.Inbound;
import com.wms.wms_lite.domain.transaction.inbound.enums.InboundStatus;
import java.time.LocalDateTime;

public record InboundCompleteResponse(
        Long id,
        String inboundNo,
        InboundStatus status,
        LocalDateTime completedAt
) {
    public static InboundCompleteResponse from(Inbound inbound) {
        return new InboundCompleteResponse(
                inbound.getId(),
                inbound.getInboundNo(),
                inbound.getStatus(),
                inbound.getCompletedAt()
        );
    }
}
