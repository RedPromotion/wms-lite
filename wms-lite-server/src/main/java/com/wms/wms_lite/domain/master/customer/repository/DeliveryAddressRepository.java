package com.wms.wms_lite.domain.master.customer.repository;

import com.wms.wms_lite.domain.master.customer.entity.DeliveryAddress;
import com.wms.wms_lite.domain.master.customer.enums.DeliveryAddressStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryAddressRepository extends JpaRepository<DeliveryAddress, Long> {
    List<DeliveryAddress> findByCustomerId(Long customerId);
    List<DeliveryAddress> findByStatus(DeliveryAddressStatus status);
    Page<DeliveryAddress> findByCustomerIdAndStatus(Long customerId, DeliveryAddressStatus status, Pageable pageable);
}
