package com.wms.wms_lite.domain.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private Long totalInventoryQuantity;
    private Long totalItemSkuCount;
    private Long todayInboundCount;
    private Long todayInboundQuantity;
    private Long todayOutboundCount;
    private Long todayOutboundQuantity;
    private Long pendingInboundCount;
    private Long pendingOutboundCount;
    private List<DashboardRecentTransactionDto> recentTransactions;
}
