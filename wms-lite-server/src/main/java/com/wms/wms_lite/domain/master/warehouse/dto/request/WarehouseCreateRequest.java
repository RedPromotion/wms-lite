package com.wms.wms_lite.domain.master.warehouse.dto.request;

import jakarta.validation.constraints.NotBlank;

public record WarehouseCreateRequest(
        @NotBlank(message = "창고 코드는 필수입니다.")
        String code,

        @NotBlank(message = "창고명은 필수입니다.")
        String name,

        String phone,
        String manager,
        String address,
        String description
) {}
