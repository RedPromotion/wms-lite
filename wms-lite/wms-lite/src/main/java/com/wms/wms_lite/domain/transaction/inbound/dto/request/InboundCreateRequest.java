package com.wms.wms_lite.domain.transaction.inbound.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record InboundCreateRequest(
        @NotNull(message = "공급업체 ID는 필수입니다.")
        Long supplierId,

        @NotEmpty(message = "입고 품목 목록은 비어 있을 수 없습니다.")
        @Valid
        List<InboundItemRequest> items,

        String description
) {}
