package com.wms.wms_lite.domain.master.customer.dto.request;

import com.wms.wms_lite.domain.master.customer.enums.CustomerStatus;

public record CustomerSearchRequest(
        String keyword,
        CustomerStatus status
) {}
