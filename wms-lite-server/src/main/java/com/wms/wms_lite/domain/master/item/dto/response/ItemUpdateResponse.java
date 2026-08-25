package com.wms.wms_lite.domain.master.item.dto.response;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.enums.UnitType;
import java.time.LocalDateTime;

public record ItemUpdateResponse(
        Long id,
        String name,
        String barcode,
        UnitType unit,
        LocalDateTime updatedAt
) {
    public static ItemUpdateResponse from(Item item) {
        return new ItemUpdateResponse(
                item.getId(),
                item.getName(),
                item.getBarcode(),
                item.getUnit(),
                item.getUpdatedAt()
        );
    }
}
