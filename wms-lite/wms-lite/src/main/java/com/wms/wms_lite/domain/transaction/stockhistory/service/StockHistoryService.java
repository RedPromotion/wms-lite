package com.wms.wms_lite.domain.transaction.stockhistory.service;

import com.wms.wms_lite.domain.transaction.inventory.event.InventoryChangedEvent;
import com.wms.wms_lite.domain.transaction.stockhistory.dto.request.StockHistorySearchRequest;
import com.wms.wms_lite.domain.transaction.stockhistory.dto.response.StockHistorySummaryResponse;
import com.wms.wms_lite.domain.transaction.stockhistory.entity.StockHistory;
import com.wms.wms_lite.domain.transaction.stockhistory.repository.StockHistoryRepository;
import com.wms.wms_lite.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockHistoryService {

    private final StockHistoryRepository stockHistoryRepository;

    public PageResponse<StockHistorySummaryResponse> getStockHistoryList(
            StockHistorySearchRequest request,
            Pageable pageable) {

        java.time.LocalDateTime startDateTime =
                request.startDate() != null ? request.startDate().atStartOfDay() : null;
        java.time.LocalDateTime endDateTime =
                request.endDate() != null ? request.endDate().plusDays(1).atStartOfDay() : null;

        Page<StockHistory> histories = stockHistoryRepository.searchStockHistories(
                request.itemId(),
                request.locationId(),
                request.historyType(),
                request.referenceNo(),
                request.keyword(),
                startDateTime,
                endDateTime,
                pageable);
        return PageResponse.from(histories.map(StockHistorySummaryResponse::from));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordHistory(InventoryChangedEvent event) {
        StockHistory history = new StockHistory();
        history.setItem(event.item());
        history.setLocation(event.location());
        history.setHistoryType(event.historyType());
        history.setBeforeQuantity(event.beforeQuantity());
        history.setChangeQuantity(event.changeQuantity());
        history.setAfterQuantity(event.afterQuantity());
        history.setReferenceNo(event.referenceNo());
        history.setDescription(event.description());
        history.setSourceLocation(event.sourceLocation());
        history.setTargetLocation(event.targetLocation());
        history.setPartnerName(event.partnerName());

        stockHistoryRepository.save(history);
    }
}
