package com.wms.wms_lite.domain.transaction.inbound.dto.request;

import com.wms.wms_lite.domain.transaction.inbound.enums.InboundStatus;

public record InboundSearchRequest(
        Long supplierId,
        InboundStatus status,
        String keyword
) {}
