package com.wms.wms_lite.domain.master.item.repository;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.entity.ItemCategory;
import com.wms.wms_lite.domain.master.item.enums.ItemStatus;
import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    boolean existsByCode(String code);
    boolean existsByBarcode(String barcode);
    Optional<Item> findByCode(String code);
    Optional<Item> findByBarcode(String barcode);
    List<Item> findByStatus(ItemStatus status);
    List<Item> findByCategory(ItemCategory category);
    List<Item> findBySupplier(Supplier supplier);

    long countByDeletedAtIsNull();

    @Query("SELECT i FROM Item i WHERE i.deletedAt IS NULL " +
           "AND (:keyword IS NULL OR i.code LIKE CONCAT('%', :keyword, '%') OR i.name LIKE CONCAT('%', :keyword, '%')) " +
           "AND (:supplierId IS NULL OR i.supplier.id = :supplierId) " +
           "AND (:categoryId IS NULL OR i.category.id = :categoryId) " +
           "AND (:status IS NULL OR i.status = :status)")
    Page<Item> searchItems(@Param("keyword") String keyword,
                           @Param("supplierId") Long supplierId,
                           @Param("categoryId") Long categoryId,
                           @Param("status") ItemStatus status,
                           Pageable pageable);
}
