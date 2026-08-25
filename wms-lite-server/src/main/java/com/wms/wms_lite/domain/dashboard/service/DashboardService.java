package com.wms.wms_lite.domain.dashboard.service;

import com.wms.wms_lite.domain.dashboard.dto.DashboardRecentTransactionDto;
import com.wms.wms_lite.domain.dashboard.dto.DashboardSummaryDto;
import com.wms.wms_lite.domain.master.item.repository.ItemRepository;
import com.wms.wms_lite.domain.transaction.inbound.enums.InboundStatus;
import com.wms.wms_lite.domain.transaction.inbound.repository.InboundRepository;
import com.wms.wms_lite.domain.transaction.inventory.repository.InventoryRepository;
import com.wms.wms_lite.domain.transaction.outbound.enums.OutboundStatus;
import com.wms.wms_lite.domain.transaction.outbound.repository.OutboundRepository;
import com.wms.wms_lite.domain.transaction.stockhistory.entity.StockHistory;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
import com.wms.wms_lite.domain.transaction.stockhistory.repository.StockHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final InventoryRepository inventoryRepository;
    private final ItemRepository itemRepository;
    private final InboundRepository inboundRepository;
    private final OutboundRepository outboundRepository;
    private final StockHistoryRepository stockHistoryRepository;

    public DashboardSummaryDto getDashboardSummary() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        Long totalInventory = inventoryRepository.sumTotalQuantity();
        long totalSku = itemRepository.countByDeletedAtIsNull();

        long todayInboundCnt = inboundRepository.countByStatusAndCompletedAtBetween(InboundStatus.COMPLETED, startOfDay, endOfDay);
        long todayInboundQty = inboundRepository.sumQuantityByStatusAndCompletedAtBetween(InboundStatus.COMPLETED, startOfDay, endOfDay);

        long todayOutboundCnt = outboundRepository.countByStatusAndCompletedAtBetween(OutboundStatus.COMPLETED, startOfDay, endOfDay);
        long todayOutboundQty = outboundRepository.sumQuantityByStatusAndCompletedAtBetween(OutboundStatus.COMPLETED, startOfDay, endOfDay);

        long pendingInboundCnt = inboundRepository.countByStatus(InboundStatus.REQUESTED);
        long pendingOutboundCnt = outboundRepository.countByStatus(OutboundStatus.REQUESTED);

        List<StockHistory> histories = stockHistoryRepository.findTop10ByOrderByCreatedAtDesc();
        List<DashboardRecentTransactionDto> recentTransactions = histories.stream()
                .map(this::toRecentTransactionDto)
                .collect(Collectors.toList());

        return DashboardSummaryDto.builder()
                .totalInventoryQuantity(totalInventory)
                .totalItemSkuCount(totalSku)
                .todayInboundCount(todayInboundCnt)
                .todayInboundQuantity(todayInboundQty)
                .todayOutboundCount(todayOutboundCnt)
                .todayOutboundQuantity(todayOutboundQty)
                .pendingInboundCount(pendingInboundCnt)
                .pendingOutboundCount(pendingOutboundCnt)
                .recentTransactions(recentTransactions)
                .build();
    }

    private DashboardRecentTransactionDto toRecentTransactionDto(StockHistory sh) {
        String typeStr = sh.getHistoryType() != null ? sh.getHistoryType().name() : "MOVEMENT";
        String typeLabel = getTypeLabel(sh.getHistoryType());

        String locCode = "";
        if (sh.getLocation() != null) {
            locCode = sh.getLocation().getCode();
        } else if (sh.getSourceLocation() != null && sh.getTargetLocation() != null) {
            locCode = sh.getSourceLocation() + " → " + sh.getTargetLocation();
        }

        return DashboardRecentTransactionDto.builder()
                .id(sh.getId())
                .time(sh.getCreatedAt())
                .type(typeStr)
                .typeLabel(typeLabel)
                .itemCode(sh.getItem() != null ? sh.getItem().getCode() : "")
                .itemName(sh.getItem() != null ? sh.getItem().getName() : "")
                .locationCode(locCode)
                .quantity(sh.getChangeQuantity())
                .status("완료")
                .build();
    }

    private String getTypeLabel(HistoryType type) {
        if (type == null) return "이동";
        switch (type) {
            case INBOUND: return "입고";
            case OUTBOUND: return "출고";
            case MOVEMENT_IN:
            case MOVEMENT_OUT: return "이동";
            case ADJUSTMENT: return "손익조정";
            default: return type.name();
        }
    }
}
