package com.wms.wms_lite.domain.transaction.stockmovement.repository;

import com.wms.wms_lite.domain.transaction.stockmovement.entity.StockMovementItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MovementItemRepository extends JpaRepository<StockMovementItem, Long> {
    @Query("SELECT smi FROM StockMovementItem smi WHERE smi.stockMovement.id = :movementId")
    List<StockMovementItem> findByMovementId(@Param("movementId") Long movementId);
    List<StockMovementItem> findByItemId(Long itemId);
}
