package com.wms.wms_lite.domain.transaction.stockhistory.dto.response;

import com.wms.wms_lite.domain.transaction.stockhistory.entity.StockHistory;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
import java.time.LocalDateTime;

public record StockHistoryResponse(
        Long id,
        String itemCode,
        String itemName,
        String locationCode,
        String locationName,
        HistoryType historyType,
        Integer beforeQuantity,
        Integer changeQuantity,
        Integer afterQuantity,
        String referenceNo,
        String description,
        LocalDateTime createdAt
) {
    public static StockHistoryResponse from(StockHistory history) {
        return new StockHistoryResponse(
                history.getId(),
                history.getItem() != null ? history.getItem().getCode() : null,
                history.getItem() != null ? history.getItem().getName() : null,
                history.getLocation() != null ? history.getLocation().getCode() : null,
                history.getLocation() != null ? history.getLocation().getName() : null,
                history.getHistoryType(),
                history.getBeforeQuantity(),
                history.getChangeQuantity(),
                history.getAfterQuantity(),
                history.getReferenceNo(),
                history.getDescription(),
                history.getCreatedAt()
        );
    }
}
