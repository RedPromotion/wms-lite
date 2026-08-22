package com.wms.wms_lite.domain.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardRecentTransactionDto {
    private Long id;
    private LocalDateTime time;
    private String type;
    private String typeLabel;
    private String itemCode;
    private String itemName;
    private String locationCode;
    private Integer quantity;
    private String status;
}
