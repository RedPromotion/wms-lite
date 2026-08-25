package com.wms.wms_lite.domain.master.customer.dto.response;

import com.wms.wms_lite.domain.master.customer.entity.DeliveryAddress;
import com.wms.wms_lite.domain.master.customer.enums.DeliveryAddressStatus;

public record DeliveryAddressSummaryResponse(
        Long id,
        String name,
        String receiverName,
        Boolean defaultAddress,
        DeliveryAddressStatus status
) {
    public static DeliveryAddressSummaryResponse from(DeliveryAddress address) {
        return new DeliveryAddressSummaryResponse(
                address.getId(),
                address.getName(),
                address.getReceiverName(),
                address.getDefaultAddress(),
                address.getStatus()
        );
    }
}
