package com.wms.wms_lite.domain.transaction.inventory.repository;

import com.wms.wms_lite.domain.transaction.inventory.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT iv FROM Inventory iv WHERE iv.id = :id")
    Optional<Inventory> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT iv FROM Inventory iv WHERE iv.item.id = :itemId AND iv.location.id = :locationId")
    Optional<Inventory> findByItemIdAndLocationIdForUpdate(@Param("itemId") Long itemId, @Param("locationId") Long locationId);

    Optional<Inventory> findByItemIdAndLocationId(Long itemId, Long locationId);
    boolean existsByItemIdAndLocationId(Long itemId, Long locationId);
    List<Inventory> findByLocationId(Long locationId);
    List<Inventory> findByItemId(Long itemId);

    @Query("SELECT iv FROM Inventory iv " +
           "WHERE (:warehouseId IS NULL OR iv.location.warehouse.id = :warehouseId) " +
           "AND (:locationId IS NULL OR iv.location.id = :locationId) " +
           "AND (:itemId IS NULL OR iv.item.id = :itemId) " +
           "AND (:keyword IS NULL OR iv.item.code LIKE CONCAT('%', :keyword, '%') OR iv.item.name LIKE CONCAT('%', :keyword, '%')) " +
           "ORDER BY iv.updatedAt DESC")
    Page<Inventory> searchInventories(@Param("warehouseId") Long warehouseId,
                                      @Param("locationId") Long locationId,
                                      @Param("itemId") Long itemId,
                                      @Param("keyword") String keyword,
                                      Pageable pageable);

    @Query("SELECT COALESCE(SUM(iv.quantity), 0) FROM Inventory iv")
    Long sumTotalQuantity();
}
