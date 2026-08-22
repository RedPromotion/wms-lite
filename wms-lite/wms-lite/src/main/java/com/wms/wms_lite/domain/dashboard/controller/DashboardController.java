package com.wms.wms_lite.domain.dashboard.controller;

import com.wms.wms_lite.domain.dashboard.dto.DashboardSummaryDto;
import com.wms.wms_lite.domain.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public DashboardSummaryDto getDashboardSummary() {
        return dashboardService.getDashboardSummary();
    }
}
