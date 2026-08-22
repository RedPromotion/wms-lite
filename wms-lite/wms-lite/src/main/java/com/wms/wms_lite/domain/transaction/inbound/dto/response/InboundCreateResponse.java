package com.wms.wms_lite.domain.transaction.inbound.dto.response;

import com.wms.wms_lite.domain.transaction.inbound.entity.Inbound;
import com.wms.wms_lite.domain.transaction.inbound.enums.InboundStatus;
import java.time.LocalDateTime;

public record InboundCreateResponse(
        Long id,
        String inboundNo,
        InboundStatus status,
        LocalDateTime createdAt
) {
    public static InboundCreateResponse from(Inbound inbound) {
        return new InboundCreateResponse(
                inbound.getId(),
                inbound.getInboundNo(),
                inbound.getStatus(),
                inbound.getCreatedAt()
        );
    }
}
