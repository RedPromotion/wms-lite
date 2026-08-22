package com.wms.wms_lite.domain.master.supplier.controller;

import com.wms.wms_lite.domain.master.supplier.dto.request.*;
import com.wms.wms_lite.domain.master.supplier.dto.response.*;
import com.wms.wms_lite.domain.master.supplier.service.SupplierService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public SupplierCreateResponse create(@Valid @RequestBody SupplierCreateRequest r) {
        return service.createSupplier(r);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public SupplierResponse get(@PathVariable Long id) {
        return service.getSupplier(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<SupplierSummaryResponse> list(SupplierSearchRequest request, Pageable p) {
        return service.getSupplierList(request, p);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public SupplierUpdateResponse update(@PathVariable Long id, @RequestBody SupplierUpdateRequest r) {
        return service.updateSupplier(id, r);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public void delete(@PathVariable Long id) {
        service.deleteSupplier(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public SupplierResponse status(@PathVariable Long id, @Valid @RequestBody SupplierStatusChangeRequest r) {
        return service.changeStatus(id, r);
    }
}
