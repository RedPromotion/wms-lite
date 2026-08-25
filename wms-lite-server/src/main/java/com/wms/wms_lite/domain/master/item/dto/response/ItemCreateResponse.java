package com.wms.wms_lite.domain.master.item.dto.response;

import com.wms.wms_lite.domain.master.item.entity.Item;
import java.time.LocalDateTime;

public record ItemCreateResponse(
        Long id,
        String code,
        String name,
        LocalDateTime createdAt
) {
    public static ItemCreateResponse from(Item item) {
        return new ItemCreateResponse(
                item.getId(),
                item.getCode(),
                item.getName(),
                item.getCreatedAt()
        );
    }
}
