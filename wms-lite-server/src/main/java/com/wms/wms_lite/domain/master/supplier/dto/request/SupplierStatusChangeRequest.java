package com.wms.wms_lite.domain.master.supplier.dto.request;

import com.wms.wms_lite.domain.master.supplier.enums.SupplierStatus;
import jakarta.validation.constraints.NotNull;

public record SupplierStatusChangeRequest(
        @NotNull(message = "상태 값은 필수입니다.")
        SupplierStatus status
) {}
