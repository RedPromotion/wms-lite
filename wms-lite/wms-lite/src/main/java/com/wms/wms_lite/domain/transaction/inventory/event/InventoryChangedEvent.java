package com.wms.wms_lite.domain.transaction.inventory.event;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;

public record InventoryChangedEvent(
        Item item,
        Location location,
        int beforeQuantity,
        int changeQuantity,
        int afterQuantity,
        HistoryType historyType,
        String referenceNo,
        String description,
        String sourceLocation,
        String targetLocation,
        String partnerName
) {
    public InventoryChangedEvent(
            Item item,
            Location location,
            int beforeQuantity,
            int changeQuantity,
            int afterQuantity,
            HistoryType historyType,
            String referenceNo,
            String description) {
        this(item, location, beforeQuantity, changeQuantity, afterQuantity, historyType, referenceNo, description, null, null, null);
    }
}
