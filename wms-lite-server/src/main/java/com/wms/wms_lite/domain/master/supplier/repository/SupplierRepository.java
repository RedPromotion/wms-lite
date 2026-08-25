package com.wms.wms_lite.domain.master.supplier.repository;

import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import com.wms.wms_lite.domain.master.supplier.enums.SupplierStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsByCode(String code);
    boolean existsByBusinessNo(String businessNo);
    Optional<Supplier> findByCode(String code);
    Optional<Supplier> findByBusinessNo(String businessNo);
    List<Supplier> findByStatus(SupplierStatus status);

    @Query("SELECT s FROM Supplier s " +
           "WHERE s.deletedAt IS NULL " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:keyword IS NULL OR s.code LIKE CONCAT('%', :keyword, '%') OR s.name LIKE CONCAT('%', :keyword, '%') OR s.ceoName LIKE CONCAT('%', :keyword, '%'))")
    Page<Supplier> searchSuppliers(@Param("keyword") String keyword,
                                   @Param("status") SupplierStatus status,
                                   Pageable pageable);
}
