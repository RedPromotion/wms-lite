package com.wms.wms_lite.domain.transaction.stockhistory.listener;

import com.wms.wms_lite.domain.transaction.inventory.event.InventoryChangedEvent;
import com.wms.wms_lite.domain.transaction.stockhistory.service.StockHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StockHistoryEventListener {

    private final StockHistoryService stockHistoryService;

    @EventListener
    public void handleInventoryChangedEvent(InventoryChangedEvent event) {
        stockHistoryService.recordHistory(event);
    }
}
