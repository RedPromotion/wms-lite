package com.wms.wms_lite.domain.master.customer.controller;

import com.wms.wms_lite.domain.master.customer.dto.request.DeliveryAddressCreateRequest;
import com.wms.wms_lite.domain.master.customer.dto.request.DeliveryAddressStatusChangeRequest;
import com.wms.wms_lite.domain.master.customer.dto.request.DeliveryAddressUpdateRequest;
import com.wms.wms_lite.domain.master.customer.dto.response.DeliveryAddressCreateResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.DeliveryAddressResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.DeliveryAddressSummaryResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.DeliveryAddressUpdateResponse;
import com.wms.wms_lite.domain.master.customer.service.DeliveryAddressService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customers/{customerId}/addresses")
public class DeliveryAddressController {

    private final DeliveryAddressService deliveryAddressService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeliveryAddressCreateResponse createDeliveryAddress(
            @PathVariable Long customerId,
            @Valid @RequestBody DeliveryAddressCreateRequest request) {
        return deliveryAddressService.createDeliveryAddress(customerId, request);
    }

    @GetMapping
    public PageResponse<DeliveryAddressSummaryResponse> getDeliveryAddressList(
            @PathVariable Long customerId,
            Pageable pageable) {
        return deliveryAddressService.getDeliveryAddressList(customerId, pageable);
    }

    @GetMapping("/{addressId}")
    public DeliveryAddressResponse getDeliveryAddress(
            @PathVariable Long customerId,
            @PathVariable Long addressId) {
        return deliveryAddressService.getDeliveryAddress(addressId);
    }

    @PutMapping("/{addressId}")
    public DeliveryAddressUpdateResponse updateDeliveryAddress(
            @PathVariable Long customerId,
            @PathVariable Long addressId,
            @Valid @RequestBody DeliveryAddressUpdateRequest request) {
        return deliveryAddressService.updateDeliveryAddress(addressId, request);
    }

    @DeleteMapping("/{addressId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDeliveryAddress(
            @PathVariable Long customerId,
            @PathVariable Long addressId) {
        deliveryAddressService.deleteDeliveryAddress(addressId);
    }

    @PutMapping("/{addressId}/status")
    public DeliveryAddressResponse changeStatus(
            @PathVariable Long customerId,
            @PathVariable Long addressId,
            @Valid @RequestBody DeliveryAddressStatusChangeRequest request) {
        return deliveryAddressService.changeStatus(addressId, request);
    }

    @PutMapping("/{addressId}/default")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setDefaultAddress(
            @PathVariable Long customerId,
            @PathVariable Long addressId) {
        deliveryAddressService.setDefaultAddress(customerId, addressId);
    }
}
