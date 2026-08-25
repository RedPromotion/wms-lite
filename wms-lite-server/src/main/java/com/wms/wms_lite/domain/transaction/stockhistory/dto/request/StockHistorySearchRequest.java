package com.wms.wms_lite.domain.transaction.stockhistory.dto.request;

import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
import java.time.LocalDate;

public record StockHistorySearchRequest(
        Long itemId,
        Long locationId,
        HistoryType historyType,
        String referenceNo,
        String keyword,
        LocalDate startDate,
        LocalDate endDate
) {}
