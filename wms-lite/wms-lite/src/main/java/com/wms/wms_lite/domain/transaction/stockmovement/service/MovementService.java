package com.wms.wms_lite.domain.transaction.stockmovement.service;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.repository.ItemRepository;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.master.warehouse.repository.LocationRepository;
import com.wms.wms_lite.domain.transaction.inventory.exception.InventoryErrorCode;
import com.wms.wms_lite.domain.transaction.inventory.exception.InventoryException;
import com.wms.wms_lite.domain.transaction.inventory.service.InventoryService;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.request.MovementCompleteRequest;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.request.MovementCreateRequest;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.request.MovementItemRequest;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.request.MovementSearchRequest;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.response.MovementCompleteResponse;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.response.MovementCreateResponse;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.response.MovementResponse;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.response.MovementSummaryResponse;
import com.wms.wms_lite.domain.transaction.stockmovement.entity.StockMovement;
import com.wms.wms_lite.domain.transaction.stockmovement.entity.StockMovementItem;
import com.wms.wms_lite.domain.transaction.stockmovement.exception.MovementErrorCode;
import com.wms.wms_lite.domain.transaction.stockmovement.exception.MovementException;
import com.wms.wms_lite.domain.transaction.stockmovement.repository.MovementRepository;
import com.wms.wms_lite.global.response.PageResponse;
import com.wms.wms_lite.global.util.UniqueNoGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovementService {

    private final MovementRepository movementRepository;
    private final ItemRepository itemRepository;
    private final LocationRepository locationRepository;
    private final InventoryService inventoryService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Retryable(retryFor = { DataIntegrityViolationException.class }, maxAttempts = 5, backoff = @Backoff(delay = 100))
    public MovementCreateResponse createMovement(MovementCreateRequest request) {
        StockMovement movement = StockMovement.create(request.description());
        movement.setMovementNo(UniqueNoGenerator.generate("MV"));

        for (MovementItemRequest itemReq : request.items()) {
            if (itemReq.fromLocationId().equals(itemReq.toLocationId())) {
                throw new MovementException(MovementErrorCode.MOVEMENT_SAME_LOCATION);
            }

            Item item = itemRepository.findById(itemReq.itemId())
                    .orElseThrow(() -> new MovementException(MovementErrorCode.MOVEMENT_ITEM_NOT_FOUND));
            if (item.isDeleted()) {
                throw new MovementException(MovementErrorCode.MOVEMENT_ITEM_NOT_FOUND);
            }

            Location fromLocation = locationRepository.findById(itemReq.fromLocationId())
                    .orElseThrow(() -> new MovementException(MovementErrorCode.MOVEMENT_FROM_LOCATION_NOT_FOUND));
            if (fromLocation.isDeleted()) {
                throw new MovementException(MovementErrorCode.MOVEMENT_FROM_LOCATION_NOT_FOUND);
            }

            Location toLocation = locationRepository.findById(itemReq.toLocationId())
                    .orElseThrow(() -> new MovementException(MovementErrorCode.MOVEMENT_TO_LOCATION_NOT_FOUND));
            if (toLocation.isDeleted()) {
                throw new MovementException(MovementErrorCode.MOVEMENT_TO_LOCATION_NOT_FOUND);
            }

            // 출발지 가용 재고 검증 및 비관적 락 예약 원자적 수행
            try {
                inventoryService.reserveInventoryByItemAndLocation(item.getId(), fromLocation.getId(),
                        itemReq.quantity());
            } catch (InventoryException e) {
                if (e.getErrorCode() == InventoryErrorCode.INVENTORY_RESERVE_EXCEEDED
                        || e.getErrorCode() == InventoryErrorCode.INVENTORY_NOT_FOUND) {
                    throw new MovementException(MovementErrorCode.MOVEMENT_INSUFFICIENT_INVENTORY);
                }
                throw e;
            }

            StockMovementItem movementItem = new StockMovementItem();
            movementItem.setItem(item);
            movementItem.setFromLocation(fromLocation);
            movementItem.setToLocation(toLocation);
            movementItem.setQuantity(itemReq.quantity());

            movement.addItem(movementItem);
        }

        // JPA 롤백 마크 및 즉시 DB Unique 제약조건 감지를 위해 saveAndFlush 사용
        try {
            StockMovement saved = movementRepository.saveAndFlush(movement);
            return MovementCreateResponse.from(saved);
        } catch (DataIntegrityViolationException e) {
            throw e;
        }
    }

    public MovementResponse getMovement(Long id) {
        StockMovement movement = movementRepository.findById(id)
                .orElseThrow(() -> new MovementException(MovementErrorCode.MOVEMENT_NOT_FOUND));
        return MovementResponse.from(movement);
    }

    public PageResponse<MovementSummaryResponse> getMovementList(MovementSearchRequest request, Pageable pageable) {
        Page<StockMovement> movements = movementRepository.searchMovements(
                request.status(),
                request.keyword(),
                pageable);
        return PageResponse.from(movements.map(MovementSummaryResponse::from));
    }

    @Transactional
    public MovementCompleteResponse completeMovement(Long id, MovementCompleteRequest request) {
        StockMovement movement = movementRepository.findById(id)
                .orElseThrow(() -> new MovementException(MovementErrorCode.MOVEMENT_NOT_FOUND));

        // 각 품목별 재고 이동 처리 (출발지 재고 차감 및 예약 해제 + 목적지 재고 증가)
        for (StockMovementItem movementItem : movement.getItems()) {
            inventoryService.moveInventory(
                    movementItem.getItem().getId(),
                    movementItem.getFromLocation().getId(),
                    movementItem.getToLocation().getId(),
                    movementItem.getQuantity(),
                    movement.getMovementNo(),
                    request.description());
        }

        movement.complete(request.description());
        return MovementCompleteResponse.from(movement);
    }

    @Transactional
    public void cancelMovement(Long id) {
        StockMovement movement = movementRepository.findById(id)
                .orElseThrow(() -> new MovementException(MovementErrorCode.MOVEMENT_NOT_FOUND));

        // 예약 수량 원복 (비관적 락으로 동시성 보호)
        for (StockMovementItem movementItem : movement.getItems()) {
            inventoryService.releaseInventoryByItemAndLocation(
                    movementItem.getItem().getId(),
                    movementItem.getFromLocation().getId(),
                    movementItem.getQuantity());
        }

        movement.cancel();
    }
}
