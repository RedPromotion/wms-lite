package com.wms.wms_lite.domain.master.supplier.dto.response;

import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import com.wms.wms_lite.domain.master.supplier.enums.SupplierStatus;
import java.time.LocalDateTime;

public record SupplierResponse(
        Long id,
        String code,
        String name,
        String businessNo,
        String ceoName,
        String phone,
        String email,
        String address,
        SupplierStatus status,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static SupplierResponse from(Supplier s) {
        return new SupplierResponse(
                s.getId(),
                s.getCode(),
                s.getName(),
                s.getBusinessNo(),
                s.getCeoName(),
                s.getPhone(),
                s.getEmail(),
                s.getAddress(),
                s.getStatus(),
                s.getDescription(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
