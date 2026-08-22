package com.wms.wms_lite.domain.master.supplier.entity;

import com.wms.wms_lite.domain.master.supplier.enums.SupplierStatus;
import com.wms.wms_lite.global.entity.SoftDeleteEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "suppliers")
public class Supplier extends SoftDeleteEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(unique = true, length = 30)
    private String businessNo;

    private String ceoName;
    private String phone;
    private String email;
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SupplierStatus status = SupplierStatus.ACTIVE;
}
