package com.wms.wms_lite.domain.master.warehouse.repository;

import com.wms.wms_lite.domain.master.warehouse.entity.Warehouse;
import com.wms.wms_lite.domain.master.warehouse.enums.WarehouseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    boolean existsByCode(String code);
    Optional<Warehouse> findByCode(String code);
    List<Warehouse> findByStatus(WarehouseStatus status);

    @Query("SELECT w FROM Warehouse w " +
           "WHERE w.deletedAt IS NULL " +
           "AND (:status IS NULL OR w.status = :status) " +
           "AND (:keyword IS NULL OR w.code LIKE CONCAT('%', :keyword, '%') OR w.name LIKE CONCAT('%', :keyword, '%') OR w.manager LIKE CONCAT('%', :keyword, '%'))")
    Page<Warehouse> searchWarehouses(@Param("keyword") String keyword,
                                     @Param("status") WarehouseStatus status,
                                     Pageable pageable);
}
