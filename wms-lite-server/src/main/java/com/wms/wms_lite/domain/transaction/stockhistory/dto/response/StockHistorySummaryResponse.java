package com.wms.wms_lite.domain.transaction.stockhistory.dto.response;

import com.wms.wms_lite.domain.transaction.stockhistory.entity.StockHistory;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
import java.time.LocalDateTime;

public record StockHistorySummaryResponse(
        Long id,
        String itemCode,
        String itemName,
        String locationCode,
        HistoryType historyType,
        Integer beforeQuantity,
        Integer changeQuantity,
        Integer afterQuantity,
        String referenceNo,
        String description,
        String sourceLocation,
        String targetLocation,
        String partnerName,
        LocalDateTime createdAt
) {
    public static StockHistorySummaryResponse from(StockHistory history) {
        return new StockHistorySummaryResponse(
                history.getId(),
                history.getItem() != null ? history.getItem().getCode() : null,
                history.getItem() != null ? history.getItem().getName() : null,
                history.getLocation() != null ? history.getLocation().getCode() : null,
                history.getHistoryType(),
                history.getBeforeQuantity(),
                history.getChangeQuantity(),
                history.getAfterQuantity(),
                history.getReferenceNo(),
                history.getDescription(),
                history.getSourceLocation(),
                history.getTargetLocation(),
                history.getPartnerName(),
                history.getCreatedAt()
        );
    }
}
