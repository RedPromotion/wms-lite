package com.wms.wms_lite.domain.transaction.outbound.repository;

import com.wms.wms_lite.domain.transaction.outbound.entity.Outbound;
import com.wms.wms_lite.domain.transaction.outbound.enums.OutboundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OutboundRepository extends JpaRepository<Outbound, Long> {
    boolean existsByOutboundNo(String outboundNo);
    Optional<Outbound> findByOutboundNo(String outboundNo);
    List<Outbound> findByCustomerId(Long customerId);
    List<Outbound> findByStatus(OutboundStatus status);

    long countByStatus(OutboundStatus status);

    @Query("SELECT COUNT(ob) FROM Outbound ob WHERE ob.status = :status AND ob.completedAt >= :startOfDay AND ob.completedAt <= :endOfDay")
    long countByStatusAndCompletedAtBetween(@Param("status") OutboundStatus status, @Param("startOfDay") java.time.LocalDateTime startOfDay, @Param("endOfDay") java.time.LocalDateTime endOfDay);

    @Query("SELECT COALESCE(SUM(item.quantity), 0) FROM Outbound ob JOIN ob.items item WHERE ob.status = :status AND ob.completedAt >= :startOfDay AND ob.completedAt <= :endOfDay")
    long sumQuantityByStatusAndCompletedAtBetween(@Param("status") OutboundStatus status, @Param("startOfDay") java.time.LocalDateTime startOfDay, @Param("endOfDay") java.time.LocalDateTime endOfDay);

    @Query("SELECT ob FROM Outbound ob " +
           "WHERE (:customerId IS NULL OR ob.customer.id = :customerId) " +
           "AND (:status IS NULL OR ob.status = :status) " +
           "AND (:keyword IS NULL OR ob.outboundNo LIKE CONCAT('%', :keyword, '%') OR ob.customer.name LIKE CONCAT('%', :keyword, '%'))")
    Page<Outbound> searchOutbounds(@Param("customerId") Long customerId,
                                   @Param("status") OutboundStatus status,
                                   @Param("keyword") String keyword,
                                   Pageable pageable);
}
