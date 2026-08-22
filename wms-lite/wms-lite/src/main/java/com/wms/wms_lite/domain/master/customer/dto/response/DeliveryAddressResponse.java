package com.wms.wms_lite.domain.master.customer.dto.response;

import com.wms.wms_lite.domain.master.customer.entity.DeliveryAddress;
import com.wms.wms_lite.domain.master.customer.enums.DeliveryAddressStatus;
import java.time.LocalDateTime;

public record DeliveryAddressResponse(
        Long id,
        Long customerId,
        String customerName,
        String name,
        String receiverName,
        String receiverPhone,
        String zipCode,
        String address,
        String detailAddress,
        Boolean defaultAddress,
        DeliveryAddressStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static DeliveryAddressResponse from(DeliveryAddress address) {
        return new DeliveryAddressResponse(
                address.getId(),
                address.getCustomer() != null ? address.getCustomer().getId() : null,
                address.getCustomer() != null ? address.getCustomer().getName() : null,
                address.getName(),
                address.getReceiverName(),
                address.getReceiverPhone(),
                address.getZipCode(),
                address.getAddress(),
                address.getDetailAddress(),
                address.getDefaultAddress(),
                address.getStatus(),
                address.getCreatedAt(),
                address.getUpdatedAt()
        );
    }
}
