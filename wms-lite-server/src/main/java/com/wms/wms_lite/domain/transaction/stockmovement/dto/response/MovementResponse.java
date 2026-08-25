package com.wms.wms_lite.domain.transaction.stockmovement.dto.response;

import com.wms.wms_lite.domain.transaction.stockmovement.entity.StockMovement;
import com.wms.wms_lite.domain.transaction.stockmovement.enums.MovementStatus;
import java.time.LocalDateTime;
import java.util.List;

public record MovementResponse(
        Long id,
        String movementNo,
        MovementStatus status,
        List<MovementItemResponse> items,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static MovementResponse from(StockMovement movement) {
        List<MovementItemResponse> itemResponses = movement.getItems().stream()
                .map(MovementItemResponse::from)
                .toList();

        return new MovementResponse(
                movement.getId(),
                movement.getMovementNo(),
                movement.getStatus(),
                itemResponses,
                movement.getCompletedAt(),
                movement.getCreatedAt(),
                movement.getUpdatedAt()
        );
    }
}
