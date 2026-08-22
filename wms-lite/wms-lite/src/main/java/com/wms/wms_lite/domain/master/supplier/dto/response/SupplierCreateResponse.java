package com.wms.wms_lite.domain.master.supplier.dto.response;

import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import java.time.LocalDateTime;

public record SupplierCreateResponse(
        Long id,
        String code,
        String name,
        LocalDateTime createdAt
) {
    public static SupplierCreateResponse from(Supplier s) {
        return new SupplierCreateResponse(
                s.getId(),
                s.getCode(),
                s.getName(),
                s.getCreatedAt()
        );
    }
}
