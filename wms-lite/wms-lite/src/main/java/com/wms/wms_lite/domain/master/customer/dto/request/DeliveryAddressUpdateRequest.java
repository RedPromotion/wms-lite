package com.wms.wms_lite.domain.master.customer.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeliveryAddressUpdateRequest(
        @NotBlank(message = "배송지명은 필수입니다.")
        @Size(max = 150, message = "배송지명은 150자 이하여야 합니다.")
        String name,

        @Size(max = 100, message = "수령인은 100자 이하여야 합니다.")
        String receiverName,

        @Size(max = 30, message = "수령인 연락처는 30자 이하여야 합니다.")
        String receiverPhone,

        @Size(max = 10, message = "우편번호는 10자 이하여야 합니다.")
        String zipCode,

        @Size(max = 300, message = "기본주소는 300자 이하여야 합니다.")
        String address,

        @Size(max = 300, message = "상세주소는 300자 이하여야 합니다.")
        String detailAddress,

        Boolean defaultAddress,

        @Size(max = 500, message = "설명은 500자 이하여야 합니다.")
        String description
) {}
