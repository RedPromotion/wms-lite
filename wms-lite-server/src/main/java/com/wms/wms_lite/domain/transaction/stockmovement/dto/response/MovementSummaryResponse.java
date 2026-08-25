package com.wms.wms_lite.domain.transaction.stockmovement.dto.response;

import com.wms.wms_lite.domain.transaction.stockmovement.entity.StockMovement;
import com.wms.wms_lite.domain.transaction.stockmovement.entity.StockMovementItem;
import com.wms.wms_lite.domain.transaction.stockmovement.enums.MovementStatus;
import java.time.LocalDateTime;

public record MovementSummaryResponse(
        Long id,
        String movementNo,
        String movementCode,
        String fromLocationCode,
        String toLocationCode,
        String itemCode,
        String itemName,
        Integer quantity,
        MovementStatus status,
        LocalDateTime requestedAt,
        LocalDateTime createdAt
) {
    public static MovementSummaryResponse from(StockMovement movement) {
        String fromLoc = null;
        String toLoc = null;
        String itemCodeStr = null;
        String itemNameStr = null;
        int totalQty = 0;

        if (movement.getItems() != null && !movement.getItems().isEmpty()) {
            StockMovementItem first = movement.getItems().get(0);
            if (first.getFromLocation() != null) {
                fromLoc = first.getFromLocation().getCode();
            }
            if (first.getToLocation() != null) {
                toLoc = first.getToLocation().getCode();
            }
            if (first.getItem() != null) {
                itemCodeStr = first.getItem().getCode();
                itemNameStr = first.getItem().getName();
            }
            totalQty = movement.getItems().stream()
                    .mapToInt(i -> i.getQuantity() != null ? i.getQuantity() : 0)
                    .sum();
            if (movement.getItems().size() > 1 && itemNameStr != null) {
                itemNameStr = itemNameStr + " 외 " + (movement.getItems().size() - 1) + "건";
            }
        }

        return new MovementSummaryResponse(
                movement.getId(),
                movement.getMovementNo(),
                movement.getMovementNo(),
                fromLoc,
                toLoc,
                itemCodeStr,
                itemNameStr,
                totalQty,
                movement.getStatus(),
                movement.getCreatedAt(),
                movement.getCreatedAt()
        );
    }
}
