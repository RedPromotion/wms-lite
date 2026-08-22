package com.wms.wms_lite.domain.master.warehouse.entity;

import com.wms.wms_lite.domain.master.warehouse.enums.LocationStatus;
import com.wms.wms_lite.global.entity.SoftDeleteEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "locations")
public class Location extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Warehouse warehouse;

    @Column(nullable = false, unique = true, length = 80)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    private Integer xAxis;
    private Integer yAxis;
    private Integer zAxis;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LocationStatus status = LocationStatus.ACTIVE;
}
