package com.wms.wms_lite.domain.transaction.inventory.service;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.repository.ItemRepository;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.master.warehouse.repository.LocationRepository;
import com.wms.wms_lite.domain.transaction.inventory.dto.request.InventoryAdjustRequest;
import com.wms.wms_lite.domain.transaction.inventory.dto.response.InventoryAdjustResponse;
import com.wms.wms_lite.domain.transaction.inventory.dto.response.InventoryResponse;
import com.wms.wms_lite.domain.transaction.inventory.entity.Inventory;
import com.wms.wms_lite.domain.transaction.inventory.event.InventoryChangedEvent;
import com.wms.wms_lite.domain.transaction.inventory.exception.InventoryErrorCode;
import com.wms.wms_lite.domain.transaction.inventory.exception.InventoryException;
import com.wms.wms_lite.domain.transaction.inventory.repository.InventoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * [재고 관리 단위 테스트 (InventoryServiceTest)]
 *
 * 주요 검증 항목:
 * 1. createInventory: 최초 재고 생성 시 중복 체크 및 이력 이벤트(InventoryChangedEvent) 발행 검증
 * 2. reserveInventory: 출고/이송을 위한 수량 예약 시 가용재고(quantity - reservedQuantity) 초과
 * 예외 처리 검증
 * 3. moveInventory: 출발지 재고 차감 & 목적지 재고 증가 및 오름차순 락(데드락 방지) 처리 검증
 * 4. adjustInventory: 관리자 수량 조정 시 차이값 계산 및 이력 이벤트 발행 검증
 */
@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    @DisplayName("최초 재고 생성 성공 - 중복이 없는 경우 생성되고 이력 이벤트가 발행된다")
    void createInventory_success() {
        // given
        Long itemId = 1L;
        Long locationId = 10L;

        Item item = new Item();
        ReflectionTestUtils.setField(item, "id", itemId);

        Location location = new Location();
        ReflectionTestUtils.setField(location, "id", locationId);

        given(inventoryRepository.existsByItemIdAndLocationId(itemId, locationId)).willReturn(false);
        given(itemRepository.findById(itemId)).willReturn(Optional.of(item));
        given(locationRepository.findById(locationId)).willReturn(Optional.of(location));
        given(inventoryRepository.save(any(Inventory.class))).willAnswer(invocation -> {
            Inventory inv = invocation.getArgument(0);
            ReflectionTestUtils.setField(inv, "id", 100L);
            return inv;
        });

        // when
        InventoryResponse response = inventoryService.createInventory(itemId, locationId, 50);

        // then
        assertThat(response).isNotNull();
        assertThat(response.quantity()).isEqualTo(50);
        verify(eventPublisher).publishEvent(any(InventoryChangedEvent.class));
    }

    @Test
    @DisplayName("최초 재고 생성 실패 - 이미 존재하는 품목+로케이션 조합일 경우 예외가 발생한다")
    void createInventory_alreadyExists() {
        // given
        Long itemId = 1L;
        Long locationId = 10L;
        given(inventoryRepository.existsByItemIdAndLocationId(itemId, locationId)).willReturn(true);

        // when & then
        assertThatThrownBy(() -> inventoryService.createInventory(itemId, locationId, 50))
                .isInstanceOf(InventoryException.class)
                .hasMessageContaining(InventoryErrorCode.INVENTORY_ALREADY_EXISTS.getMessage());
    }

    @Test
    @DisplayName("재고 예약 성공 - 가용재고 내 수량 예약 시 reservedQuantity가 증가한다")
    void reserveInventory_success() {
        // given
        Long inventoryId = 100L;
        Item item = new Item();
        Location location = new Location();
        Inventory inventory = Inventory.create(item, location, 100);

        given(inventoryRepository.findByIdForUpdate(inventoryId)).willReturn(Optional.of(inventory));

        // when
        InventoryResponse response = inventoryService.reserveInventory(inventoryId, 30);

        // then
        assertThat(response.reservedQuantity()).isEqualTo(30);
        assertThat(response.availableQuantity()).isEqualTo(70);
    }

    @Test
    @DisplayName("재고 예약 실패 - 가용재고(100-80=20)를 초과하는 수량(30) 예약 시 예외가 발생한다")
    void reserveInventory_exceeded() {
        // given
        Long inventoryId = 100L;
        Item item = new Item();
        Location location = new Location();
        Inventory inventory = Inventory.create(item, location, 100);
        inventory.reserve(80); // 이미 80개 예약됨 (가용재고 20개 남음)

        given(inventoryRepository.findByIdForUpdate(inventoryId)).willReturn(Optional.of(inventory));

        // when & then
        assertThatThrownBy(() -> inventoryService.reserveInventory(inventoryId, 30))
                .isInstanceOf(InventoryException.class)
                .hasMessageContaining(InventoryErrorCode.INVENTORY_RESERVE_EXCEEDED.getMessage());
    }

    @Test
    @DisplayName("재고 이송 성공 - 출발지 수량 차감 및 목적지 수량 증가가 처리되고 2건의 이벤트가 발행된다")
    void moveInventory_success() {
        // given
        Long itemId = 1L;
        Long fromLocationId = 10L;
        Long toLocationId = 20L;

        Item item = new Item();
        Location fromLoc = new Location();
        ReflectionTestUtils.setField(fromLoc, "id", fromLocationId);
        Location toLoc = new Location();
        ReflectionTestUtils.setField(toLoc, "id", toLocationId);

        Inventory fromInv = Inventory.create(item, fromLoc, 100);
        Inventory toInv = Inventory.create(item, toLoc, 10);

        // 데드락 방지 락 획득 Mocking (Location ID 10L -> 20L 오름차순 획득)
        given(inventoryRepository.findByItemIdAndLocationIdForUpdate(itemId, fromLocationId))
                .willReturn(Optional.of(fromInv));
        given(inventoryRepository.findByItemIdAndLocationIdForUpdate(itemId, toLocationId))
                .willReturn(Optional.of(toInv));

        // when
        inventoryService.moveInventory(itemId, fromLocationId, toLocationId, 30, "MOV-001", "로케이션 이송");

        // then
        assertThat(fromInv.getQuantity()).isEqualTo(70);
        assertThat(toInv.getQuantity()).isEqualTo(40);

        // MOVEMENT_OUT, MOVEMENT_IN 2건의 이력 이벤트 발행 검증
        verify(eventPublisher, times(2)).publishEvent(any(InventoryChangedEvent.class));
    }

    @Test
    @DisplayName("재고 이송 실패 - 출발지 재고 수량이 부족하면 INVENTORY_INSUFFICIENT_QUANTITY 예외가 발생한다")
    void moveInventory_insufficientQuantity() {
        // given
        Long itemId = 1L;
        Long fromLocationId = 10L;
        Long toLocationId = 20L;

        Item item = new Item();
        Location fromLoc = new Location();
        Location toLoc = new Location();

        Inventory fromInv = Inventory.create(item, fromLoc, 10); // 출발지 10개만 있음
        Inventory toInv = Inventory.create(item, toLoc, 0);

        given(inventoryRepository.findByItemIdAndLocationIdForUpdate(itemId, fromLocationId))
                .willReturn(Optional.of(fromInv));
        given(inventoryRepository.findByItemIdAndLocationIdForUpdate(itemId, toLocationId))
                .willReturn(Optional.of(toInv));

        // when & then (50개 이송 시도)
        assertThatThrownBy(() -> inventoryService.moveInventory(itemId, fromLocationId, toLocationId, 50, "REF", "이송"))
                .isInstanceOf(InventoryException.class)
                .hasMessageContaining(InventoryErrorCode.INVENTORY_INSUFFICIENT_QUANTITY.getMessage());
    }

    @Test
    @DisplayName("재고 수량 조정 성공 - 관리자 조정 수량으로 갱신되고 이력 이벤트가 발행된다")
    void adjustInventory_success() {
        // given
        Long inventoryId = 100L;
        Item item = new Item();
        Location location = new Location();
        Inventory inventory = Inventory.create(item, location, 50);

        given(inventoryRepository.findByIdForUpdate(inventoryId)).willReturn(Optional.of(inventory));
        InventoryAdjustRequest adjustRequest = new InventoryAdjustRequest(80, "실사 결과 수량 조정");

        // when
        InventoryAdjustResponse response = inventoryService.adjustInventory(inventoryId, adjustRequest);

        // then
        assertThat(response.quantity()).isEqualTo(80);
        verify(eventPublisher).publishEvent(any(InventoryChangedEvent.class));
    }
}
