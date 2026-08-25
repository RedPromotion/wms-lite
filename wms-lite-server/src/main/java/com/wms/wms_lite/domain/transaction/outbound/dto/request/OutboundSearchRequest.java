package com.wms.wms_lite.domain.transaction.outbound.dto.request;

import com.wms.wms_lite.domain.transaction.outbound.enums.OutboundStatus;

public record OutboundSearchRequest(
        Long customerId,
        OutboundStatus status,
        String keyword
) {}
