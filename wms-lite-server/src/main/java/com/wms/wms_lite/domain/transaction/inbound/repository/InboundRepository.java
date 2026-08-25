package com.wms.wms_lite.domain.transaction.inbound.repository;

import com.wms.wms_lite.domain.transaction.inbound.entity.Inbound;
import com.wms.wms_lite.domain.transaction.inbound.enums.InboundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InboundRepository extends JpaRepository<Inbound, Long> {
    boolean existsByInboundNo(String inboundNo);
    Optional<Inbound> findByInboundNo(String inboundNo);
    List<Inbound> findBySupplierId(Long supplierId);
    List<Inbound> findByStatus(InboundStatus status);

    long countByStatus(InboundStatus status);

    @Query("SELECT COUNT(ib) FROM Inbound ib WHERE ib.status = :status AND ib.completedAt >= :startOfDay AND ib.completedAt <= :endOfDay")
    long countByStatusAndCompletedAtBetween(@Param("status") InboundStatus status, @Param("startOfDay") java.time.LocalDateTime startOfDay, @Param("endOfDay") java.time.LocalDateTime endOfDay);

    @Query("SELECT COALESCE(SUM(item.quantity), 0) FROM Inbound ib JOIN ib.items item WHERE ib.status = :status AND ib.completedAt >= :startOfDay AND ib.completedAt <= :endOfDay")
    long sumQuantityByStatusAndCompletedAtBetween(@Param("status") InboundStatus status, @Param("startOfDay") java.time.LocalDateTime startOfDay, @Param("endOfDay") java.time.LocalDateTime endOfDay);

    @Query("SELECT ib FROM Inbound ib " +
           "WHERE (:supplierId IS NULL OR ib.supplier.id = :supplierId) " +
           "AND (:status IS NULL OR ib.status = :status) " +
           "AND (:keyword IS NULL OR ib.inboundNo LIKE CONCAT('%', :keyword, '%') OR ib.supplier.name LIKE CONCAT('%', :keyword, '%'))")
    Page<Inbound> searchInbounds(@Param("supplierId") Long supplierId,
                                 @Param("status") InboundStatus status,
                                 @Param("keyword") String keyword,
                                 Pageable pageable);
}
