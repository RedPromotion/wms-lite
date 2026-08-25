package com.wms.wms_lite.domain.transaction.outbound.entity;

import com.wms.wms_lite.domain.master.customer.entity.Customer;
import com.wms.wms_lite.domain.master.customer.entity.DeliveryAddress;
import com.wms.wms_lite.domain.transaction.outbound.enums.OutboundStatus;
import com.wms.wms_lite.domain.transaction.outbound.exception.OutboundErrorCode;
import com.wms.wms_lite.domain.transaction.outbound.exception.OutboundException;
import com.wms.wms_lite.global.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "outbounds")
public class Outbound extends AuditableEntity {

    @Setter
    @Column(nullable = false, unique = true, length = 50)
    private String outboundNo;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_address_id", nullable = false)
    private DeliveryAddress deliveryAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OutboundStatus status = OutboundStatus.REQUESTED;

    @Version
    private Long version;

    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "outbound", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OutboundItem> items = new ArrayList<>();

    public static Outbound create(Customer customer, DeliveryAddress deliveryAddress, String description) {
        Outbound outbound = new Outbound();
        outbound.customer = customer;
        outbound.deliveryAddress = deliveryAddress;
        outbound.status = OutboundStatus.REQUESTED;
        if (description != null) {
            outbound.setDescription(description);
        }
        return outbound;
    }

    public void addItem(OutboundItem item) {
        this.items.add(item);
        item.setOutbound(this);
    }

    public void complete(String description) {
        if (this.status == OutboundStatus.COMPLETED) {
            throw new OutboundException(OutboundErrorCode.OUTBOUND_ALREADY_COMPLETED);
        }
        if (this.status == OutboundStatus.CANCELED) {
            throw new OutboundException(OutboundErrorCode.OUTBOUND_ALREADY_CANCELED);
        }
        if (this.status != OutboundStatus.REQUESTED) {
            throw new OutboundException(OutboundErrorCode.OUTBOUND_INVALID_STATUS);
        }
        this.status = OutboundStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
        if (description != null) {
            setDescription(description);
        }
    }

    public void cancel() {
        if (this.status != OutboundStatus.REQUESTED) {
            throw new OutboundException(OutboundErrorCode.OUTBOUND_CANCEL_FAILED);
        }
        this.status = OutboundStatus.CANCELED;
    }
}
