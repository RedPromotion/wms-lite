package com.wms.wms_lite.domain.master.supplier.dto.response;

import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import java.time.LocalDateTime;

public record SupplierUpdateResponse(
        Long id,
        String name,
        String phone,
        String email,
        LocalDateTime updatedAt
) {
    public static SupplierUpdateResponse from(Supplier s) {
        return new SupplierUpdateResponse(
                s.getId(),
                s.getName(),
                s.getPhone(),
                s.getEmail(),
                s.getUpdatedAt()
        );
    }
}
