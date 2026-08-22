package com.wms.wms_lite.domain.master.customer.dto.response;

import com.wms.wms_lite.domain.master.customer.entity.DeliveryAddress;
import java.time.LocalDateTime;

public record DeliveryAddressCreateResponse(
        Long id,
        String name,
        LocalDateTime createdAt
) {
    public static DeliveryAddressCreateResponse from(DeliveryAddress address) {
        return new DeliveryAddressCreateResponse(
                address.getId(),
                address.getName(),
                address.getCreatedAt()
        );
    }
}
