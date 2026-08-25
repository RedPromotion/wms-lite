package com.wms.wms_lite.domain.transaction.inventory.service;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.repository.ItemRepository;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.master.warehouse.repository.LocationRepository;
import com.wms.wms_lite.domain.transaction.inventory.dto.request.InventoryAdjustRequest;
import com.wms.wms_lite.domain.transaction.inventory.dto.request.InventorySearchRequest;
import com.wms.wms_lite.domain.transaction.inventory.dto.response.InventoryAdjustResponse;
import com.wms.wms_lite.domain.transaction.inventory.dto.response.InventoryResponse;
import com.wms.wms_lite.domain.transaction.inventory.dto.response.InventorySummaryResponse;
import com.wms.wms_lite.domain.transaction.inventory.entity.Inventory;
import com.wms.wms_lite.domain.transaction.inventory.event.InventoryChangedEvent;
import com.wms.wms_lite.domain.transaction.inventory.exception.InventoryErrorCode;
import com.wms.wms_lite.domain.transaction.inventory.exception.InventoryException;
import com.wms.wms_lite.domain.transaction.inventory.repository.InventoryRepository;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
import com.wms.wms_lite.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ItemRepository itemRepository;
    private final LocationRepository locationRepository;
    private final ApplicationEventPublisher eventPublisher;

    public InventoryResponse getInventory(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_NOT_FOUND));
        return InventoryResponse.from(inventory);
    }

    public PageResponse<InventorySummaryResponse> getInventoryList(InventorySearchRequest request, Pageable pageable) {
        Page<Inventory> inventories = inventoryRepository.searchInventories(
                request.warehouseId(),
                request.locationId(),
                request.itemId(),
                request.keyword(),
                pageable);
        return PageResponse.from(inventories.map(InventorySummaryResponse::from));
    }

    @Transactional
    public InventoryResponse createInventory(Long itemId, Long locationId, int initialQuantity) {
        if (inventoryRepository.existsByItemIdAndLocationId(itemId, locationId)) {
            throw new InventoryException(InventoryErrorCode.INVENTORY_ALREADY_EXISTS);
        }

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_ITEM_NOT_FOUND));
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_LOCATION_NOT_FOUND));

        Inventory inventory = Inventory.create(item, location, initialQuantity);
        Inventory saved = inventoryRepository.save(inventory);

        if (initialQuantity > 0) {
            eventPublisher.publishEvent(new InventoryChangedEvent(
                    item, location, 0, initialQuantity, initialQuantity,
                    HistoryType.ADJUSTMENT, null, "최초 재고 생성"));
        }

        return InventoryResponse.from(saved);
    }

    @Transactional
    public void increaseQuantity(Long itemId, Long locationId, int quantity, HistoryType historyType,
            String referenceNo, String description) {
        increaseQuantity(itemId, locationId, quantity, historyType, referenceNo, description, null, null, null);
    }

    @Transactional
    public void increaseQuantity(Long itemId, Long locationId, int quantity, HistoryType historyType,
            String referenceNo, String description, String sourceLocation, String targetLocation, String partnerName) {
        Inventory inventory = inventoryRepository.findByItemIdAndLocationIdForUpdate(itemId, locationId)
                .orElseGet(() -> {
                    Item item = itemRepository.findById(itemId)
                            .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_ITEM_NOT_FOUND));
                    Location location = locationRepository.findById(locationId)
                            .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_LOCATION_NOT_FOUND));
                    return inventoryRepository.save(Inventory.create(item, location, 0));
                });

        int before = inventory.getQuantity();
        inventory.increaseQuantity(quantity);
        int after = inventory.getQuantity();

        eventPublisher.publishEvent(new InventoryChangedEvent(
                inventory.getItem(),
                inventory.getLocation(),
                before,
                quantity,
                after,
                historyType,
                referenceNo,
                description,
                sourceLocation,
                targetLocation,
                partnerName));
    }

    @Transactional
    public void decreaseQuantity(Long itemId, Long locationId, int quantity, HistoryType historyType,
            String referenceNo, String description) {
        Inventory inventory = inventoryRepository.findByItemIdAndLocationIdForUpdate(itemId, locationId)
                .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_NOT_FOUND));

        int before = inventory.getQuantity();
        inventory.decreaseQuantity(quantity);
        int after = inventory.getQuantity();

        eventPublisher.publishEvent(new InventoryChangedEvent(
                inventory.getItem(),
                inventory.getLocation(),
                before,
                -quantity,
                after,
                historyType,
                referenceNo,
                description));
    }

    @Transactional
    public void decreaseReservedQuantity(Long itemId, Long locationId, int quantity, HistoryType historyType,
            String referenceNo, String description) {
        decreaseReservedQuantity(itemId, locationId, quantity, historyType, referenceNo, description, null, null, null);
    }

    @Transactional
    public void decreaseReservedQuantity(Long itemId, Long locationId, int quantity, HistoryType historyType,
            String referenceNo, String description, String sourceLocation, String targetLocation, String partnerName) {
        Inventory inventory = inventoryRepository.findByItemIdAndLocationIdForUpdate(itemId, locationId)
                .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_NOT_FOUND));

        int before = inventory.getQuantity();
        inventory.decreaseReservedQuantity(quantity);
        int after = inventory.getQuantity();

        eventPublisher.publishEvent(new InventoryChangedEvent(
                inventory.getItem(),
                inventory.getLocation(),
                before,
                -quantity,
                after,
                historyType,
                referenceNo,
                description,
                sourceLocation,
                targetLocation,
                partnerName));
    }


    @Transactional
    public void moveInventory(Long itemId, Long fromLocationId, Long toLocationId, int quantity, String referenceNo,
            String description) {
        if (quantity <= 0) {
            throw new InventoryException(InventoryErrorCode.INVENTORY_INVALID_QUANTITY);
        }

        if (fromLocationId.equals(toLocationId)) {
            throw new InventoryException(InventoryErrorCode.INVENTORY_INVALID_QUANTITY);
        }

        // 데드락 방지: 항상 Location ID 오름차순으로 비관적 락(Select For Update) 획득
        Long firstLocId = Math.min(fromLocationId, toLocationId);
        Long secondLocId = Math.max(fromLocationId, toLocationId);

        Inventory firstInventory = getOrCreateInventoryForUpdate(itemId, firstLocId);
        Inventory secondInventory = getOrCreateInventoryForUpdate(itemId, secondLocId);

        Inventory fromInventory = fromLocationId.equals(firstLocId) ? firstInventory : secondInventory;
        Inventory toInventory = fromLocationId.equals(firstLocId) ? secondInventory : firstInventory;

        if (fromInventory.getQuantity() < quantity) {
            throw new InventoryException(InventoryErrorCode.INVENTORY_INSUFFICIENT_QUANTITY);
        }

        // 출발지 재고 차감 처리
        int beforeFrom = fromInventory.getQuantity();
        fromInventory.deductQuantityAndReserved(quantity);
        int afterFrom = fromInventory.getQuantity();

        eventPublisher.publishEvent(new InventoryChangedEvent(
                fromInventory.getItem(),
                fromInventory.getLocation(),
                beforeFrom,
                -quantity,
                afterFrom,
                HistoryType.MOVEMENT_OUT,
                referenceNo,
                description));

        // 목적지 재고 증가 처리 (이미 락을 고정 순서로 안전하게 획득함)
        int beforeTo = toInventory.getQuantity();
        toInventory.increaseQuantity(quantity);
        int afterTo = toInventory.getQuantity();

        eventPublisher.publishEvent(new InventoryChangedEvent(
                toInventory.getItem(),
                toInventory.getLocation(),
                beforeTo,
                quantity,
                afterTo,
                HistoryType.MOVEMENT_IN,
                referenceNo,
                description));
    }

    private Inventory getOrCreateInventoryForUpdate(Long itemId, Long locationId) {
        return inventoryRepository.findByItemIdAndLocationIdForUpdate(itemId, locationId)
                .orElseGet(() -> {
                    Item item = itemRepository.findById(itemId)
                            .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_ITEM_NOT_FOUND));
                    Location location = locationRepository.findById(locationId)
                            .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_LOCATION_NOT_FOUND));
                    return inventoryRepository.save(Inventory.create(item, location, 0));
                });
    }

    @Transactional
    public InventoryAdjustResponse adjustInventory(Long id, InventoryAdjustRequest request) {
        Inventory inventory = inventoryRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_NOT_FOUND));

        int before = inventory.getQuantity();
        int after = request.quantity();
        int change = after - before;

        inventory.adjustQuantity(after);

        if (change != 0) {
            eventPublisher.publishEvent(new InventoryChangedEvent(
                    inventory.getItem(),
                    inventory.getLocation(),
                    before,
                    change,
                    after,
                    HistoryType.ADJUSTMENT,
                    null,
                    request.reason()));
        }

        return InventoryAdjustResponse.from(inventory);
    }

    @Transactional
    public InventoryResponse reserveInventory(Long id, int quantity) {
        Inventory inventory = inventoryRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_NOT_FOUND));

        inventory.reserve(quantity);
        return InventoryResponse.from(inventory);
    }

    @Transactional
    public InventoryResponse reserveInventoryByItemAndLocation(Long itemId, Long locationId, int quantity) {
        Inventory inventory = inventoryRepository.findByItemIdAndLocationIdForUpdate(itemId, locationId)
                .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_NOT_FOUND));

        inventory.reserve(quantity);
        return InventoryResponse.from(inventory);
    }

    @Transactional
    public InventoryResponse releaseInventory(Long id, int quantity) {
        Inventory inventory = inventoryRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_NOT_FOUND));

        inventory.release(quantity);
        return InventoryResponse.from(inventory);
    }

    /**
     * 출고/이동 취소 시 예약 수량을 해제합니다.
     * itemId + locationId 기반으로 비관적 락을 획득하여 동시성 문제를 방지합니다.
     */
    @Transactional
    public void releaseInventoryByItemAndLocation(Long itemId, Long locationId, int quantity) {
        Inventory inventory = inventoryRepository.findByItemIdAndLocationIdForUpdate(itemId, locationId)
                .orElseThrow(() -> new InventoryException(InventoryErrorCode.INVENTORY_NOT_FOUND));

        inventory.release(quantity);
    }
}
