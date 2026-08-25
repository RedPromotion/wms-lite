package com.wms.wms_lite.domain.master.supplier.dto.response;

import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import com.wms.wms_lite.domain.master.supplier.enums.SupplierStatus;

public record SupplierSummaryResponse(
        Long id,
        String code,
        String name,
        String phone,
        SupplierStatus status
) {
    public static SupplierSummaryResponse from(Supplier s) {
        return new SupplierSummaryResponse(
                s.getId(),
                s.getCode(),
                s.getName(),
                s.getPhone(),
                s.getStatus()
        );
    }
}
