package com.wms.wms_lite.domain.master.warehouse.entity;

import com.wms.wms_lite.domain.master.warehouse.enums.WarehouseStatus;
import com.wms.wms_lite.global.entity.SoftDeleteEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "warehouses")
public class Warehouse extends SoftDeleteEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    private String phone;
    private String manager;
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WarehouseStatus status = WarehouseStatus.ACTIVE;
}
