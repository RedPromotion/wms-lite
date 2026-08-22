package com.wms.wms_lite.domain.master.customer.dto.response;

import com.wms.wms_lite.domain.master.customer.entity.Customer;
import com.wms.wms_lite.domain.master.customer.enums.CustomerStatus;

public record CustomerSummaryResponse(
        Long id,
        String code,
        String name,
        String phone,
        CustomerStatus status
) {
    public static CustomerSummaryResponse from(Customer customer) {
        return new CustomerSummaryResponse(
                customer.getId(),
                customer.getCode(),
                customer.getName(),
                customer.getPhone(),
                customer.getStatus()
        );
    }
}
