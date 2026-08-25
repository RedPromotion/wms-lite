package com.wms.wms_lite.domain.master.customer.service;

import com.wms.wms_lite.domain.master.customer.dto.request.DeliveryAddressCreateRequest;
import com.wms.wms_lite.domain.master.customer.dto.request.DeliveryAddressStatusChangeRequest;
import com.wms.wms_lite.domain.master.customer.dto.request.DeliveryAddressUpdateRequest;
import com.wms.wms_lite.domain.master.customer.dto.response.DeliveryAddressCreateResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.DeliveryAddressResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.DeliveryAddressSummaryResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.DeliveryAddressUpdateResponse;
import com.wms.wms_lite.domain.master.customer.entity.Customer;
import com.wms.wms_lite.domain.master.customer.entity.DeliveryAddress;
import com.wms.wms_lite.domain.master.customer.enums.DeliveryAddressStatus;
import com.wms.wms_lite.domain.master.customer.exception.CustomerErrorCode;
import com.wms.wms_lite.domain.master.customer.exception.CustomerException;
import com.wms.wms_lite.domain.master.customer.exception.DeliveryAddressErrorCode;
import com.wms.wms_lite.domain.master.customer.exception.DeliveryAddressException;
import com.wms.wms_lite.domain.master.customer.repository.CustomerRepository;
import com.wms.wms_lite.domain.master.customer.repository.DeliveryAddressRepository;
import com.wms.wms_lite.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeliveryAddressService {

    private final DeliveryAddressRepository deliveryAddressRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public DeliveryAddressCreateResponse createDeliveryAddress(Long customerId, DeliveryAddressCreateRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND));

        if (customer.isDeleted()) {
            throw new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND);
        }

        DeliveryAddress address = new DeliveryAddress();
        address.setCustomer(customer);
        address.setName(request.name());
        address.setReceiverName(request.receiverName());
        address.setReceiverPhone(request.receiverPhone());
        address.setZipCode(request.zipCode());
        address.setAddress(request.address());
        address.setDetailAddress(request.detailAddress());
        address.setDescription(request.description());
        address.setStatus(DeliveryAddressStatus.ACTIVE);

        if (Boolean.TRUE.equals(request.defaultAddress())) {
            resetDefaultAddresses(customerId);
            address.setDefaultAddress(true);
        } else {
            address.setDefaultAddress(false);
        }

        DeliveryAddress saved = deliveryAddressRepository.save(address);
        return DeliveryAddressCreateResponse.from(saved);
    }

    public DeliveryAddressResponse getDeliveryAddress(Long addressId) {
        DeliveryAddress address = deliveryAddressRepository.findById(addressId)
                .orElseThrow(() -> new DeliveryAddressException(DeliveryAddressErrorCode.DELIVERY_ADDRESS_NOT_FOUND));
        return DeliveryAddressResponse.from(address);
    }

    public PageResponse<DeliveryAddressSummaryResponse> getDeliveryAddressList(Long customerId, Pageable pageable) {
        Page<DeliveryAddress> addresses = deliveryAddressRepository.findByCustomerIdAndStatus(
                customerId,
                DeliveryAddressStatus.ACTIVE,
                pageable
        );
        return PageResponse.from(addresses.map(DeliveryAddressSummaryResponse::from));
    }

    @Transactional
    public DeliveryAddressUpdateResponse updateDeliveryAddress(Long addressId, DeliveryAddressUpdateRequest request) {
        DeliveryAddress address = deliveryAddressRepository.findById(addressId)
                .orElseThrow(() -> new DeliveryAddressException(DeliveryAddressErrorCode.DELIVERY_ADDRESS_NOT_FOUND));

        address.setName(request.name());
        address.setReceiverName(request.receiverName());
        address.setReceiverPhone(request.receiverPhone());
        address.setZipCode(request.zipCode());
        address.setAddress(request.address());
        address.setDetailAddress(request.detailAddress());
        address.setDescription(request.description());

        if (Boolean.TRUE.equals(request.defaultAddress())) {
            resetDefaultAddresses(address.getCustomer().getId());
            address.setDefaultAddress(true);
        } else {
            address.setDefaultAddress(false);
        }

        return DeliveryAddressUpdateResponse.from(address);
    }

    @Transactional
    public void deleteDeliveryAddress(Long addressId) {
        DeliveryAddress address = deliveryAddressRepository.findById(addressId)
                .orElseThrow(() -> new DeliveryAddressException(DeliveryAddressErrorCode.DELIVERY_ADDRESS_NOT_FOUND));
        deliveryAddressRepository.delete(address);
    }

    @Transactional
    public DeliveryAddressResponse changeStatus(Long addressId, DeliveryAddressStatusChangeRequest request) {
        DeliveryAddress address = deliveryAddressRepository.findById(addressId)
                .orElseThrow(() -> new DeliveryAddressException(DeliveryAddressErrorCode.DELIVERY_ADDRESS_NOT_FOUND));

        if (address.getStatus() == request.status()) {
            if (request.status() == DeliveryAddressStatus.ACTIVE) {
                throw new DeliveryAddressException(DeliveryAddressErrorCode.DELIVERY_ADDRESS_ALREADY_ACTIVE);
            } else {
                throw new DeliveryAddressException(DeliveryAddressErrorCode.DELIVERY_ADDRESS_ALREADY_INACTIVE);
            }
        }

        address.setStatus(request.status());
        return DeliveryAddressResponse.from(address);
    }

    @Transactional
    public void setDefaultAddress(Long customerId, Long addressId) {
        DeliveryAddress address = deliveryAddressRepository.findById(addressId)
                .orElseThrow(() -> new DeliveryAddressException(DeliveryAddressErrorCode.DELIVERY_ADDRESS_NOT_FOUND));

        if (!address.getCustomer().getId().equals(customerId)) {
            throw new DeliveryAddressException(DeliveryAddressErrorCode.DELIVERY_ADDRESS_NOT_FOUND);
        }

        if (Boolean.TRUE.equals(address.getDefaultAddress())) {
            throw new DeliveryAddressException(DeliveryAddressErrorCode.DELIVERY_ADDRESS_ALREADY_DEFAULT);
        }

        resetDefaultAddresses(customerId);
        address.setDefaultAddress(true);
    }

    private void resetDefaultAddresses(Long customerId) {
        List<DeliveryAddress> addresses = deliveryAddressRepository.findByCustomerId(customerId);
        for (DeliveryAddress addr : addresses) {
            if (Boolean.TRUE.equals(addr.getDefaultAddress())) {
                addr.setDefaultAddress(false);
            }
        }
    }
}
