package com.wms.wms_lite.domain.transaction.stockhistory.controller;

import com.wms.wms_lite.domain.transaction.stockhistory.dto.request.StockHistorySearchRequest;
import com.wms.wms_lite.domain.transaction.stockhistory.dto.response.StockHistorySummaryResponse;
import com.wms.wms_lite.domain.transaction.stockhistory.service.StockHistoryService;
import com.wms.wms_lite.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stock-histories")
public class StockHistoryController {

    private final StockHistoryService stockHistoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<StockHistorySummaryResponse> getStockHistoryList(
            StockHistorySearchRequest request,
            Pageable pageable) {
        return stockHistoryService.getStockHistoryList(request, pageable);
    }
}
