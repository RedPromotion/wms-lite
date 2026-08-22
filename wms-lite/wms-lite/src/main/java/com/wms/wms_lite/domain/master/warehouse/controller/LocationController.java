package com.wms.wms_lite.domain.master.warehouse.controller;

import com.wms.wms_lite.domain.master.warehouse.dto.request.*;
import com.wms.wms_lite.domain.master.warehouse.dto.response.*;
import com.wms.wms_lite.domain.master.warehouse.service.LocationService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/warehouses/{warehouseId}/locations")
public class LocationController {

    private final LocationService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public LocationCreateResponse create(
            @PathVariable Long warehouseId,
            @Valid @RequestBody LocationCreateRequest r) {
        return service.createLocation(warehouseId, r);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<LocationSummaryResponse> list(
            @PathVariable Long warehouseId,
            Pageable p) {
        return service.getLocationList(warehouseId, p);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public LocationResponse get(@PathVariable Long id) {
        return service.getLocation(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public LocationUpdateResponse update(
            @PathVariable Long id,
            @RequestBody LocationUpdateRequest r) {
        return service.updateLocation(id, r);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public void delete(@PathVariable Long id) {
        service.deleteLocation(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public LocationResponse status(
            @PathVariable Long id,
            @Valid @RequestBody LocationStatusChangeRequest r) {
        return service.changeStatus(id, r);
    }
}
