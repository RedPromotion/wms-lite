package com.wms.wms_lite.domain.master.item.entity;

import com.wms.wms_lite.domain.master.item.enums.ItemStatus;
import com.wms.wms_lite.domain.master.item.enums.UnitType;
import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import com.wms.wms_lite.global.entity.SoftDeleteEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "items")
public class Item extends SoftDeleteEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 100)
    private String barcode;

    @Column(length = 200)
    private String specification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UnitType unit = UnitType.EA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ItemStatus status = ItemStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ItemCategory category;

    @Column
    private Integer safetyStockQuantity;
}
