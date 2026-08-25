package com.wms.wms_lite.domain.master.item.dto.request;

import com.wms.wms_lite.domain.master.item.enums.ItemStatus;

public record ItemSearchRequest(
        String keyword,
        Long supplierId,
        Long categoryId,
        ItemStatus status
) {}
