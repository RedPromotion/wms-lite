package com.wms.wms_lite.domain.transaction.stockhistory.repository;

import com.wms.wms_lite.domain.transaction.stockhistory.entity.StockHistory;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {
    List<StockHistory> findByItemId(Long itemId);
    List<StockHistory> findByLocationId(Long locationId);

    List<StockHistory> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT sh FROM StockHistory sh " +
           "WHERE (:itemId IS NULL OR sh.item.id = :itemId) " +
           "AND (:locationId IS NULL OR sh.location.id = :locationId) " +
           "AND (:historyType IS NULL OR sh.historyType = :historyType) " +
           "AND (:referenceNo IS NULL OR sh.referenceNo LIKE CONCAT('%', :referenceNo, '%')) " +
           "AND (:keyword IS NULL OR sh.item.code LIKE CONCAT('%', :keyword, '%') OR sh.item.name LIKE CONCAT('%', :keyword, '%')) " +
           "AND (:startDate IS NULL OR sh.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR sh.createdAt < :endDate) " +
           "ORDER BY sh.createdAt DESC")
    Page<StockHistory> searchStockHistories(@Param("itemId") Long itemId,
                                            @Param("locationId") Long locationId,
                                            @Param("historyType") HistoryType historyType,
                                            @Param("referenceNo") String referenceNo,
                                            @Param("keyword") String keyword,
                                            @Param("startDate") java.time.LocalDateTime startDate,
                                            @Param("endDate") java.time.LocalDateTime endDate,
                                            Pageable pageable);
}
