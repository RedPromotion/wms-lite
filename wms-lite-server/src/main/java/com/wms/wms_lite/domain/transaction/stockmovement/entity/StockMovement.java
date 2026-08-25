package com.wms.wms_lite.domain.transaction.stockmovement.entity;

import com.wms.wms_lite.domain.transaction.stockmovement.enums.MovementStatus;
import com.wms.wms_lite.domain.transaction.stockmovement.exception.MovementErrorCode;
import com.wms.wms_lite.domain.transaction.stockmovement.exception.MovementException;
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
@Table(name = "stock_movements")
public class StockMovement extends AuditableEntity {

    @Setter
    @Column(nullable = false, unique = true, length = 50)
    private String movementNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MovementStatus status = MovementStatus.REQUESTED;

    @Version
    private Long version;

    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "stockMovement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockMovementItem> items = new ArrayList<>();

    public static StockMovement create(String description) {
        StockMovement movement = new StockMovement();
        movement.status = MovementStatus.REQUESTED;
        if (description != null) {
            movement.setDescription(description);
        }
        return movement;
    }

    public void addItem(StockMovementItem item) {
        this.items.add(item);
        item.setStockMovement(this);
    }

    public void complete(String description) {
        if (this.status == MovementStatus.COMPLETED) {
            throw new MovementException(MovementErrorCode.MOVEMENT_ALREADY_COMPLETED);
        }
        if (this.status == MovementStatus.CANCELED) {
            throw new MovementException(MovementErrorCode.MOVEMENT_ALREADY_CANCELED);
        }
        if (this.status != MovementStatus.REQUESTED) {
            throw new MovementException(MovementErrorCode.MOVEMENT_INVALID_STATUS);
        }
        this.status = MovementStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
        if (description != null) {
            setDescription(description);
        }
    }

    public void cancel() {
        if (this.status != MovementStatus.REQUESTED) {
            throw new MovementException(MovementErrorCode.MOVEMENT_CANCEL_FAILED);
        }
        this.status = MovementStatus.CANCELED;
    }
}
