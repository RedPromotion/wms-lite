package com.wms.wms_lite.domain.master.supplier.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SupplierCreateRequest(
        @NotBlank(message = "공급업체 코드는 필수입니다.")
        String code,

        @NotBlank(message = "공급업체명은 필수입니다.")
        String name,

        String businessNo,
        String ceoName,
        String phone,
        String email,
        String address,
        String description
) {}
