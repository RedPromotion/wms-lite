package com.wms.wms_lite.domain.master.customer.controller;

import com.wms.wms_lite.domain.master.customer.dto.request.CustomerCreateRequest;
import com.wms.wms_lite.domain.master.customer.dto.request.CustomerSearchRequest;
import com.wms.wms_lite.domain.master.customer.dto.request.CustomerStatusChangeRequest;
import com.wms.wms_lite.domain.master.customer.dto.request.CustomerUpdateRequest;
import com.wms.wms_lite.domain.master.customer.dto.response.CustomerCreateResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.CustomerResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.CustomerSummaryResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.CustomerUpdateResponse;
import com.wms.wms_lite.domain.master.customer.service.CustomerService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public CustomerCreateResponse createCustomer(@Valid @RequestBody CustomerCreateRequest request) {
        return customerService.createCustomer(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public CustomerResponse getCustomer(@PathVariable Long id) {
        return customerService.getCustomer(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<CustomerSummaryResponse> getCustomerList(CustomerSearchRequest request, Pageable pageable) {
        return customerService.getCustomerList(request, pageable);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public CustomerUpdateResponse updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerUpdateRequest request) {
        return customerService.updateCustomer(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public void deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public CustomerResponse changeStatus(@PathVariable Long id, @Valid @RequestBody CustomerStatusChangeRequest request) {
        return customerService.changeStatus(id, request);
    }
}
