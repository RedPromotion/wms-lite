package com.wms.wms_lite.domain.master.item.dto.request;

import com.wms.wms_lite.domain.master.item.enums.ItemStatus;
import jakarta.validation.constraints.NotNull;

public record ItemStatusChangeRequest(
        @NotNull(message = "품목 상태는 필수입니다.")
        ItemStatus status
) {}
