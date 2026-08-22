package com.wms.wms_lite.domain.master.item.repository;

import com.wms.wms_lite.domain.master.item.entity.ItemCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ItemCategoryRepository extends JpaRepository<ItemCategory, Long> {
    boolean existsByCode(String code);
    Optional<ItemCategory> findByCode(String code);
}
