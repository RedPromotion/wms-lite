package com.wms.wms_lite.domain.master.item.dto.request;

import com.wms.wms_lite.domain.master.item.enums.UnitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ItemUpdateRequest(
        @NotBlank(message = "품목명은 필수입니다.")
        @Size(max = 150, message = "품목명은 150자 이하여야 합니다.")
        String name,

        @Size(max = 100, message = "바코드는 100자 이하여야 합니다.")
        String barcode,

        Long supplierId,

        Long categoryId,

        @NotNull(message = "단위는 필수입니다.")
        UnitType unit,

        @Size(max = 200, message = "규격은 200자 이하여야 합니다.")
        String specification,

        @Size(max = 500, message = "설명은 500자 이하여야 합니다.")
        String description,

        Integer safetyStockQuantity
) {}
