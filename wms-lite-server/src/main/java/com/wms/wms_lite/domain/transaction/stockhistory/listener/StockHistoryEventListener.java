package com.wms.wms_lite.domain.transaction.stockhistory.listener;

import com.wms.wms_lite.domain.transaction.inventory.event.InventoryChangedEvent;
import com.wms.wms_lite.domain.transaction.stockhistory.service.StockHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class StockHistoryEventListener {

    private final StockHistoryService stockHistoryService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleInventoryChangedEvent(InventoryChangedEvent event) {
        stockHistoryService.recordHistory(event);
    }
}
