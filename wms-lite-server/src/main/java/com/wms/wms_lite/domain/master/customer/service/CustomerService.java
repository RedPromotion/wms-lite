package com.wms.wms_lite.domain.master.customer.service;

import com.wms.wms_lite.domain.master.customer.dto.request.CustomerCreateRequest;
import com.wms.wms_lite.domain.master.customer.dto.request.CustomerSearchRequest;
import com.wms.wms_lite.domain.master.customer.dto.request.CustomerStatusChangeRequest;
import com.wms.wms_lite.domain.master.customer.dto.request.CustomerUpdateRequest;
import com.wms.wms_lite.domain.master.customer.dto.response.CustomerCreateResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.CustomerResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.CustomerSummaryResponse;
import com.wms.wms_lite.domain.master.customer.dto.response.CustomerUpdateResponse;
import com.wms.wms_lite.domain.master.customer.entity.Customer;
import com.wms.wms_lite.domain.master.customer.enums.CustomerStatus;
import com.wms.wms_lite.domain.master.customer.exception.CustomerErrorCode;
import com.wms.wms_lite.domain.master.customer.exception.CustomerException;
import com.wms.wms_lite.domain.master.customer.repository.CustomerRepository;
import com.wms.wms_lite.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wms.wms_lite.global.util.SecurityUtils;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional
    public CustomerCreateResponse createCustomer(CustomerCreateRequest request) {
        if (customerRepository.existsByCode(request.code())) {
            throw new CustomerException(CustomerErrorCode.CUSTOMER_CODE_DUPLICATED);
        }

        if (StringUtils.hasText(request.businessNo()) && customerRepository.existsByBusinessNo(request.businessNo())) {
            throw new CustomerException(CustomerErrorCode.CUSTOMER_BUSINESS_NO_DUPLICATED);
        }

        Customer customer = new Customer();
        customer.setCode(request.code());
        customer.setName(request.name());
        customer.setBusinessNo(request.businessNo());
        customer.setCeoName(request.ceoName());
        customer.setPhone(request.phone());
        customer.setEmail(request.email());
        customer.setStatus(CustomerStatus.ACTIVE);
        customer.setDescription(request.description());

        Customer saved = customerRepository.save(customer);
        return CustomerCreateResponse.from(saved);
    }

    public CustomerResponse getCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND));
        if (customer.isDeleted()) {
            throw new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND);
        }
        return CustomerResponse.from(customer);
    }

    public PageResponse<CustomerSummaryResponse> getCustomerList(CustomerSearchRequest request, Pageable pageable) {
        Page<Customer> customers = customerRepository.searchCustomers(
                request.keyword(),
                request.status(),
                pageable
        );
        return PageResponse.from(customers.map(CustomerSummaryResponse::from));
    }

    @Transactional
    public CustomerUpdateResponse updateCustomer(Long id, CustomerUpdateRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND));
        if (customer.isDeleted()) {
            throw new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND);
        }

        if (StringUtils.hasText(request.businessNo()) && !request.businessNo().equals(customer.getBusinessNo())) {
            if (customerRepository.existsByBusinessNo(request.businessNo())) {
                throw new CustomerException(CustomerErrorCode.CUSTOMER_BUSINESS_NO_DUPLICATED);
            }
        }

        customer.setName(request.name());
        customer.setBusinessNo(request.businessNo());
        customer.setCeoName(request.ceoName());
        customer.setPhone(request.phone());
        customer.setEmail(request.email());
        customer.setDescription(request.description());

        return CustomerUpdateResponse.from(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND));
        if (customer.isDeleted()) {
            throw new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND);
        }
        customer.markDeleted(SecurityUtils.getCurrentUsername().orElseThrow(() -> new IllegalStateException("Authenticated user not found")));
    }

    @Transactional
    public CustomerResponse changeStatus(Long id, CustomerStatusChangeRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND));
        if (customer.isDeleted()) {
            throw new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND);
        }

        if (customer.getStatus() == request.status()) {
            if (request.status() == CustomerStatus.ACTIVE) {
                throw new CustomerException(CustomerErrorCode.CUSTOMER_ALREADY_ACTIVE);
            } else {
                throw new CustomerException(CustomerErrorCode.CUSTOMER_ALREADY_INACTIVE);
            }
        }

        customer.setStatus(request.status());
        return CustomerResponse.from(customer);
    }

    @Transactional
    public void activateCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND));
        if (customer.isDeleted()) {
            throw new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND);
        }
        if (customer.getStatus() == CustomerStatus.ACTIVE) {
            throw new CustomerException(CustomerErrorCode.CUSTOMER_ALREADY_ACTIVE);
        }
        customer.setStatus(CustomerStatus.ACTIVE);
    }

    @Transactional
    public void deactivateCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND));
        if (customer.isDeleted()) {
            throw new CustomerException(CustomerErrorCode.CUSTOMER_NOT_FOUND);
        }
        if (customer.getStatus() == CustomerStatus.INACTIVE) {
            throw new CustomerException(CustomerErrorCode.CUSTOMER_ALREADY_INACTIVE);
        }
        customer.setStatus(CustomerStatus.INACTIVE);
    }
}
