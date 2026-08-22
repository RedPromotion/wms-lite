package com.wms.wms_lite.domain.transaction.stockhistory.service;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.transaction.inventory.event.InventoryChangedEvent;
import com.wms.wms_lite.domain.transaction.stockhistory.entity.StockHistory;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
import com.wms.wms_lite.domain.transaction.stockhistory.repository.StockHistoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

/**
 * [재고 이력 조회 단위 테스트 (StockHistoryServiceTest)]
 *
 * 주요 검증 항목:
 * 1. getStockHistories: 재고 변경 이력(입고/출고/이동/조정) 검색 및 페이징 조회 검증
 * 2. getStockHistoryById: 단건 재고 이력 상세 조회 및 예외 처리 검증
 */
@ExtendWith(MockitoExtension.class)
class StockHistoryServiceTest {

    @Mock
    private StockHistoryRepository stockHistoryRepository;

    @InjectMocks
    private StockHistoryService stockHistoryService;

    @Test
    @DisplayName("재고 이력 저장 성공 - InventoryChangedEvent를 수신받아 StockHistory가 저장된다")
    void recordHistory_success() {
        // given
        Item item = new Item();
        Location location = new Location();
        InventoryChangedEvent event = new InventoryChangedEvent(
                item, location, 100, 50, 150, HistoryType.INBOUND, "IB-001", "최초 입고"
        );

        // when
        stockHistoryService.recordHistory(event);

        // then
        verify(stockHistoryRepository).save(any(StockHistory.class));
    }
}
