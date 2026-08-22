package com.wms.wms_lite.domain.master.item.dto.response;

import com.wms.wms_lite.domain.master.item.entity.ItemCategory;
import com.wms.wms_lite.domain.master.item.enums.ItemStatus;
import java.time.LocalDateTime;

public record ItemCategoryResponse(
        Long id,
        String code,
        String name,
        String description,
        ItemStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ItemCategoryResponse from(ItemCategory category) {
        return new ItemCategoryResponse(
                category.getId(),
                category.getCode(),
                category.getName(),
                category.getDescription(),
                category.getStatus(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
