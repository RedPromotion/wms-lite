package com.wms.wms_lite.domain.master.item.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ItemCategoryUpdateRequest(
        @NotBlank(message = "카테고리명은 필수입니다.")
        @Size(max = 150, message = "카테고리명은 150자 이하여야 합니다.")
        String name,

        @Size(max = 500, message = "설명은 500자 이하여야 합니다.")
        String description
) {}
