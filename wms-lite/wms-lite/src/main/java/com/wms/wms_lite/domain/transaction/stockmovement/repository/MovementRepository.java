package com.wms.wms_lite.domain.transaction.stockmovement.repository;

import com.wms.wms_lite.domain.transaction.stockmovement.entity.StockMovement;
import com.wms.wms_lite.domain.transaction.stockmovement.enums.MovementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovementRepository extends JpaRepository<StockMovement, Long> {
    boolean existsByMovementNo(String movementNo);
    Optional<StockMovement> findByMovementNo(String movementNo);
    List<StockMovement> findByStatus(MovementStatus status);

    @Query("SELECT sm FROM StockMovement sm WHERE (:status IS NULL OR sm.status = :status) " +
           "AND (:keyword IS NULL OR sm.movementNo LIKE CONCAT('%', :keyword, '%') OR sm.description LIKE CONCAT('%', :keyword, '%'))")
    Page<StockMovement> searchMovements(@Param("status") MovementStatus status,
                                        @Param("keyword") String keyword,
                                        Pageable pageable);
}
