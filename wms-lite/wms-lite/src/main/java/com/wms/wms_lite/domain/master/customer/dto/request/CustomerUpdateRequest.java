package com.wms.wms_lite.domain.master.customer.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerUpdateRequest(
        @NotBlank(message = "고객명은 필수입니다.")
        @Size(max = 150, message = "고객명은 150자 이하여야 합니다.")
        String name,

        @Size(max = 30, message = "사업자등록번호는 30자 이하여야 합니다.")
        String businessNo,

        @Size(max = 100, message = "대표자명은 100자 이하여야 합니다.")
        String ceoName,

        @Size(max = 30, message = "대표 연락처는 30자 이하여야 합니다.")
        String phone,

        @Size(max = 150, message = "대표 이메일은 150자 이하여야 합니다.")
        String email,

        @Size(max = 500, message = "설명은 500자 이하여야 합니다.")
        String description
) {}
