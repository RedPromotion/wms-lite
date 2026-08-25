package com.wms.wms_lite.domain.transaction.inventory.controller;

import com.wms.wms_lite.domain.transaction.inventory.dto.request.InventoryAdjustRequest;
import com.wms.wms_lite.domain.transaction.inventory.dto.request.InventoryReleaseRequest;
import com.wms.wms_lite.domain.transaction.inventory.dto.request.InventoryReserveRequest;
import com.wms.wms_lite.domain.transaction.inventory.dto.request.InventorySearchRequest;
import com.wms.wms_lite.domain.transaction.inventory.dto.response.InventoryAdjustResponse;
import com.wms.wms_lite.domain.transaction.inventory.dto.response.InventoryResponse;
import com.wms.wms_lite.domain.transaction.inventory.dto.response.InventorySummaryResponse;
import com.wms.wms_lite.domain.transaction.inventory.service.InventoryService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inventories")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public InventoryResponse getInventory(@PathVariable Long id) {
        return inventoryService.getInventory(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<InventorySummaryResponse> getInventoryList(
            InventorySearchRequest request,
            Pageable pageable) {
        return inventoryService.getInventoryList(request, pageable);
    }

    @PutMapping("/{id}/adjust")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public InventoryAdjustResponse adjustInventory(
            @PathVariable Long id,
            @Valid @RequestBody InventoryAdjustRequest request) {
        return inventoryService.adjustInventory(id, request);
    }

    @PutMapping("/{id}/reserve")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public InventoryResponse reserveInventory(
            @PathVariable Long id,
            @Valid @RequestBody InventoryReserveRequest request) {
        return inventoryService.reserveInventory(id, request.quantity());
    }

    @PutMapping("/{id}/release")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public InventoryResponse releaseInventory(
            @PathVariable Long id,
            @Valid @RequestBody InventoryReleaseRequest request) {
        return inventoryService.releaseInventory(id, request.quantity());
    }
}
