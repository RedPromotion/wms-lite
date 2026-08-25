package com.wms.wms_lite.domain.transaction.stockhistory.listener;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.transaction.inventory.event.InventoryChangedEvent;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
import com.wms.wms_lite.domain.transaction.stockhistory.service.StockHistoryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

/**
 * [재고 이력 이벤트 리스너 테스트 (StockHistoryEventListenerTest)]
 *
 * 주요 검증 항목:
 * 1. handleInventoryChangedEvent: 메인 트랜잭션 커밋 완료(AFTER_COMMIT) 시점에 비동기/독립 트랜잭션으로 StockHistory 엔티티가 정상 영속화되는지 검증
 */
@ExtendWith(MockitoExtension.class)
class StockHistoryEventListenerTest {

    @Mock
    private StockHistoryService stockHistoryService;

    @InjectMocks
    private StockHistoryEventListener stockHistoryEventListener;

    @Test
    @DisplayName("재고 변경 이벤트 리스닝 성공 - handleInventoryChangedEvent 수신 시 stockHistoryService.recordHistory가 호출된다")
    void handleInventoryChangedEvent_success() {
        // given
        Item item = new Item();
        Location location = new Location();
        InventoryChangedEvent event = new InventoryChangedEvent(
                item, location, 10, -5, 5, HistoryType.OUTBOUND, "OB-001", "출고에 따른 이력"
        );

        // when
        stockHistoryEventListener.handleInventoryChangedEvent(event);

        // then
        verify(stockHistoryService).recordHistory(event);
    }
}
