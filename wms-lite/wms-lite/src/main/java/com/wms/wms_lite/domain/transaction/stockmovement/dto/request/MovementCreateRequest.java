package com.wms.wms_lite.domain.transaction.stockmovement.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record MovementCreateRequest(
        @NotEmpty(message = "이동 품목 목록은 비어 있을 수 없습니다.")
        @Valid
        List<MovementItemRequest> items,

        String description
) {}
