package com.wms.wms_lite.domain.master.warehouse.repository;

import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.master.warehouse.enums.LocationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
    boolean existsByCode(String code);
    List<Location> findByWarehouseId(Long warehouseId);
    List<Location> findByStatus(LocationStatus status);

    @Query("SELECT l FROM Location l " +
           "WHERE l.deletedAt IS NULL " +
           "AND l.warehouse.id = :warehouseId")
    Page<Location> findByWarehouseId(@Param("warehouseId") Long warehouseId, Pageable pageable);
}
