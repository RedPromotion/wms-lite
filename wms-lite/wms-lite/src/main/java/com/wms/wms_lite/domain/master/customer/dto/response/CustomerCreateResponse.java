package com.wms.wms_lite.domain.master.customer.dto.response;

import com.wms.wms_lite.domain.master.customer.entity.Customer;
import java.time.LocalDateTime;

public record CustomerCreateResponse(
        Long id,
        String code,
        String name,
        LocalDateTime createdAt
) {
    public static CustomerCreateResponse from(Customer customer) {
        return new CustomerCreateResponse(
                customer.getId(),
                customer.getCode(),
                customer.getName(),
                customer.getCreatedAt()
        );
    }
}
