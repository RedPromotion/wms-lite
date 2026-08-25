package com.wms.wms_lite.domain.transaction.stockmovement.dto.request;

import com.wms.wms_lite.domain.transaction.stockmovement.enums.MovementStatus;

public record MovementSearchRequest(
        MovementStatus status,
        String keyword
) {}
