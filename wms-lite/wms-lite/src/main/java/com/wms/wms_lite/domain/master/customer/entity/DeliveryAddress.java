package com.wms.wms_lite.domain.master.customer.entity;

import com.wms.wms_lite.domain.master.customer.enums.DeliveryAddressStatus;
import com.wms.wms_lite.global.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "delivery_addresses")
public class DeliveryAddress extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 100)
    private String receiverName;

    @Column(length = 30)
    private String receiverPhone;

    @Column(length = 10)
    private String zipCode;

    @Column(length = 300)
    private String address;

    @Column(length = 300)
    private String detailAddress;

    @Column(nullable = false)
    private Boolean defaultAddress = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeliveryAddressStatus status = DeliveryAddressStatus.ACTIVE;
}
