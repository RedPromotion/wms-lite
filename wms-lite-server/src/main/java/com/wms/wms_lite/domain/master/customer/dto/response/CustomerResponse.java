package com.wms.wms_lite.domain.master.customer.dto.response;

import com.wms.wms_lite.domain.master.customer.entity.Customer;
import com.wms.wms_lite.domain.master.customer.enums.CustomerStatus;
import java.time.LocalDateTime;

public record CustomerResponse(
        Long id,
        String code,
        String name,
        String businessNo,
        String ceoName,
        String phone,
        String email,
        CustomerStatus status,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getCode(),
                customer.getName(),
                customer.getBusinessNo(),
                customer.getCeoName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getStatus(),
                customer.getDescription(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }
}
