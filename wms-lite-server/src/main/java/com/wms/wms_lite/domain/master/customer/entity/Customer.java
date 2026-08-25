package com.wms.wms_lite.domain.master.customer.entity;

import com.wms.wms_lite.domain.master.customer.enums.CustomerStatus;
import com.wms.wms_lite.global.entity.SoftDeleteEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "customers")
public class Customer extends SoftDeleteEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 30)
    private String businessNo;

    @Column(length = 100)
    private String ceoName;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerStatus status = CustomerStatus.ACTIVE;
}
