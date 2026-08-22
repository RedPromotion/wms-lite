package com.wms.wms_lite.domain.master.warehouse.controller;

import com.wms.wms_lite.domain.master.warehouse.dto.request.*;
import com.wms.wms_lite.domain.master.warehouse.dto.response.*;
import com.wms.wms_lite.domain.master.warehouse.service.WarehouseService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/warehouses")
public class WarehouseController {

    private final WarehouseService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public WarehouseCreateResponse create(@Valid @RequestBody WarehouseCreateRequest r) {
        return service.createWarehouse(r);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public WarehouseResponse get(@PathVariable Long id) {
        return service.getWarehouse(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<WarehouseSummaryResponse> list(WarehouseSearchRequest r, Pageable p) {
        return service.getWarehouseList(r, p);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public WarehouseUpdateResponse update(
            @PathVariable Long id,
            @RequestBody WarehouseUpdateRequest r) {
        return service.updateWarehouse(id, r);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public void delete(@PathVariable Long id) {
        service.deleteWarehouse(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public WarehouseResponse status(
            @PathVariable Long id,
            @Valid @RequestBody WarehouseStatusChangeRequest r) {
        return service.changeStatus(id, r);
    }
}
