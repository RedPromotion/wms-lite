package com.wms.wms_lite.domain.master.customer.dto.response;

import com.wms.wms_lite.domain.master.customer.entity.DeliveryAddress;
import java.time.LocalDateTime;

public record DeliveryAddressUpdateResponse(
        Long id,
        String name,
        LocalDateTime updatedAt
) {
    public static DeliveryAddressUpdateResponse from(DeliveryAddress address) {
        return new DeliveryAddressUpdateResponse(
                address.getId(),
                address.getName(),
                address.getUpdatedAt()
        );
    }
}
