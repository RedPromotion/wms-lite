package com.wms.wms_lite.domain.transaction.inbound.entity;

import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import com.wms.wms_lite.domain.transaction.inbound.enums.InboundStatus;
import com.wms.wms_lite.domain.transaction.inbound.exception.InboundErrorCode;
import com.wms.wms_lite.domain.transaction.inbound.exception.InboundException;
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
@Table(name = "inbounds")
public class Inbound extends AuditableEntity {

    @Setter
    @Column(nullable = false, unique = true, length = 50)
    private String inboundNo;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InboundStatus status = InboundStatus.REQUESTED;

    @Version
    private Long version;

    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "inbound", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InboundItem> items = new ArrayList<>();

    public static Inbound create(Supplier supplier, String description) {
        Inbound inbound = new Inbound();
        inbound.supplier = supplier;
        inbound.status = InboundStatus.REQUESTED;
        if (description != null) {
            inbound.setDescription(description);
        }
        return inbound;
    }

    public void addItem(InboundItem item) {
        this.items.add(item);
        item.setInbound(this);
    }

    public void complete(String description) {
        if (this.status == InboundStatus.COMPLETED) {
            throw new InboundException(InboundErrorCode.INBOUND_ALREADY_COMPLETED);
        }
        if (this.status == InboundStatus.CANCELED) {
            throw new InboundException(InboundErrorCode.INBOUND_ALREADY_CANCELED);
        }
        if (this.status != InboundStatus.REQUESTED) {
            throw new InboundException(InboundErrorCode.INBOUND_INVALID_STATUS);
        }
        this.status = InboundStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
        if (description != null) {
            setDescription(description);
        }
    }

    public void cancel() {
        if (this.status != InboundStatus.REQUESTED) {
            throw new InboundException(InboundErrorCode.INBOUND_CANCEL_FAILED);
        }
        this.status = InboundStatus.CANCELED;
    }
}
