package com.wms.wms_lite.domain.master.customer.repository;

import com.wms.wms_lite.domain.master.customer.entity.Customer;
import com.wms.wms_lite.domain.master.customer.enums.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByCode(String code);
    boolean existsByBusinessNo(String businessNo);
    Optional<Customer> findByCode(String code);
    Optional<Customer> findByBusinessNo(String businessNo);
    List<Customer> findByStatus(CustomerStatus status);

    @Query("SELECT c FROM Customer c WHERE c.deletedAt IS NULL " +
           "AND (:keyword IS NULL OR c.code LIKE CONCAT('%', :keyword, '%') OR c.name LIKE CONCAT('%', :keyword, '%')) " +
           "AND (:status IS NULL OR c.status = :status)")
    Page<Customer> searchCustomers(@Param("keyword") String keyword,
                                   @Param("status") CustomerStatus status,
                                   Pageable pageable);
}
