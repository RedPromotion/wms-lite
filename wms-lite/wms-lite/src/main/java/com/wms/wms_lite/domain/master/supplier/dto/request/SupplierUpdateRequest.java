package com.wms.wms_lite.domain.master.supplier.dto.request;

public record SupplierUpdateRequest(
        String name,
        String businessNo,
        String ceoName,
        String phone,
        String email,
        String address,
        String description
) {}
