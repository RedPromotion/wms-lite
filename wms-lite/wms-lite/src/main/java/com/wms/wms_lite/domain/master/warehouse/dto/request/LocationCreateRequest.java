package com.wms.wms_lite.domain.master.warehouse.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LocationCreateRequest(
        @NotNull(message = "창고 ID는 필수입니다.")
        Long warehouseId,

        @NotBlank(message = "로케이션 코드는 필수입니다.")
        String code,

        @NotBlank(message = "로케이션명은 필수입니다.")
        String name,

        Integer xAxis,
        Integer yAxis,
        Integer zAxis,
        String description
) {}
