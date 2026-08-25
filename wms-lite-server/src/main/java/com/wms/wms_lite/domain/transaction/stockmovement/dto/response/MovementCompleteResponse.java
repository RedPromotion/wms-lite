package com.wms.wms_lite.domain.transaction.stockmovement.dto.response;

import com.wms.wms_lite.domain.transaction.stockmovement.entity.StockMovement;
import com.wms.wms_lite.domain.transaction.stockmovement.enums.MovementStatus;
import java.time.LocalDateTime;

public record MovementCompleteResponse(
        Long id,
        String movementNo,
        MovementStatus status,
        LocalDateTime completedAt
) {
    public static MovementCompleteResponse from(StockMovement movement) {
        return new MovementCompleteResponse(
                movement.getId(),
                movement.getMovementNo(),
                movement.getStatus(),
                movement.getCompletedAt()
        );
    }
}
