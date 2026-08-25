package com.wms.wms_lite.domain.master.customer.dto.response;

import com.wms.wms_lite.domain.master.customer.entity.Customer;
import java.time.LocalDateTime;

public record CustomerUpdateResponse(
        Long id,
        String name,
        String phone,
        String email,
        LocalDateTime updatedAt
) {
    public static CustomerUpdateResponse from(Customer customer) {
        return new CustomerUpdateResponse(
                customer.getId(),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getUpdatedAt()
        );
    }
}
