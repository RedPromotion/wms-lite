package com.wms.wms_lite.domain.master.supplier.dto.request;

import com.wms.wms_lite.domain.master.supplier.enums.SupplierStatus;

public record SupplierSearchRequest(
        String keyword,
        SupplierStatus status
) {}
