package com.wms.wms_lite.domain.master.item.entity;

import com.wms.wms_lite.domain.master.item.enums.ItemStatus;
import com.wms.wms_lite.global.entity.SoftDeleteEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "item_categories")
public class ItemCategory extends SoftDeleteEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ItemStatus status = ItemStatus.ACTIVE;
}
