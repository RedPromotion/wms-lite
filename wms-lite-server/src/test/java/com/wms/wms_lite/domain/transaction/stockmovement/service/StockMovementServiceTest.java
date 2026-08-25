package com.wms.wms_lite.domain.transaction.stockmovement.service;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.repository.ItemRepository;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.master.warehouse.repository.LocationRepository;
import com.wms.wms_lite.domain.transaction.inventory.service.InventoryService;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.request.MovementCompleteRequest;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.request.MovementCreateRequest;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.request.MovementItemRequest;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.response.MovementCompleteResponse;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.response.MovementCreateResponse;
import com.wms.wms_lite.domain.transaction.stockmovement.entity.StockMovement;
import com.wms.wms_lite.domain.transaction.stockmovement.entity.StockMovementItem;
import com.wms.wms_lite.domain.transaction.stockmovement.enums.MovementStatus;
import com.wms.wms_lite.domain.transaction.stockmovement.exception.MovementErrorCode;
import com.wms.wms_lite.domain.transaction.stockmovement.exception.MovementException;
import com.wms.wms_lite.domain.transaction.stockmovement.repository.MovementRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * [재고 이동 관리 단위 테스트 (StockMovementServiceTest)]
 *
 * 주요 검증 항목:
 * 1. createStockMovement: 창고 내 로케이션 간 이동 요청 시 출발지 수량 선점 및 전표 생성 검증
 * 2. completeStockMovement: 이동 완료 시 출발지 차감 및 목적지 재고 증가 트랜잭션 완결 검증
 * 3. cancelStockMovement: 이동 취소 시 출발지 선점 예약 해제 검증
 */
@ExtendWith(MockitoExtension.class)
class StockMovementServiceTest {

    @Mock
    private MovementRepository movementRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private MovementService movementService;

    @Test
    @DisplayName("재고 이동 전표 생성 성공 - MV 전표번호 채번 및 출발지 재고 예약이 실행된다")
    void createMovement_success() {
        // given
        Long itemId = 1L;
        Long fromLocationId = 10L;
        Long toLocationId = 20L;

        Item item = new Item();
        ReflectionTestUtils.setField(item, "id", itemId);

        Location fromLoc = new Location();
        ReflectionTestUtils.setField(fromLoc, "id", fromLocationId);

        Location toLoc = new Location();
        ReflectionTestUtils.setField(toLoc, "id", toLocationId);

        MovementItemRequest itemRequest = new MovementItemRequest(itemId, fromLocationId, toLocationId, 15);
        MovementCreateRequest createRequest = new MovementCreateRequest(List.of(itemRequest), "구역 간 이동 요청");

        given(itemRepository.findById(itemId)).willReturn(Optional.of(item));
        given(locationRepository.findById(fromLocationId)).willReturn(Optional.of(fromLoc));
        given(locationRepository.findById(toLocationId)).willReturn(Optional.of(toLoc));
        given(movementRepository.saveAndFlush(any(StockMovement.class))).willAnswer(invocation -> {
            StockMovement movement = invocation.getArgument(0);
            ReflectionTestUtils.setField(movement, "id", 1L);
            return movement;
        });

        // when
        MovementCreateResponse response = movementService.createMovement(createRequest);

        // then
        assertThat(response).isNotNull();
        assertThat(response.movementNo()).startsWith("MV-");
        assertThat(response.status()).isEqualTo(MovementStatus.REQUESTED);

        // 출발지 재고 예약 연동 검증
        verify(inventoryService).reserveInventoryByItemAndLocation(itemId, fromLocationId, 15);
    }

    @Test
    @DisplayName("재고 이동 전표 생성 실패 - 출발지 로케이션과 목적지 로케이션이 같으면 예외가 발생한다")
    void createMovement_sameLocation_throwsException() {
        // given
        Long itemId = 1L;
        Long sameLocId = 10L;

        MovementItemRequest itemRequest = new MovementItemRequest(itemId, sameLocId, sameLocId, 10);
        MovementCreateRequest createRequest = new MovementCreateRequest(List.of(itemRequest), "동일 로케이션 이송");

        // when & then
        assertThatThrownBy(() -> movementService.createMovement(createRequest))
                .isInstanceOf(MovementException.class)
                .hasMessageContaining(MovementErrorCode.MOVEMENT_SAME_LOCATION.getMessage());
    }

    @Test
    @DisplayName("재고 이동 완료 성공 - inventoryService.moveInventory 가 호출되고 상태가 COMPLETED로 갱신된다")
    void completeMovement_success() {
        // given
        Long movementId = 1L;
        Item item = new Item();
        ReflectionTestUtils.setField(item, "id", 1L);

        Location fromLoc = new Location();
        ReflectionTestUtils.setField(fromLoc, "id", 10L);

        Location toLoc = new Location();
        ReflectionTestUtils.setField(toLoc, "id", 20L);

        StockMovement movement = StockMovement.create("이동 완료건");
        movement.setMovementNo("MV-20260821-00001");

        StockMovementItem movementItem = new StockMovementItem();
        movementItem.setItem(item);
        movementItem.setFromLocation(fromLoc);
        movementItem.setToLocation(toLoc);
        movementItem.setQuantity(25);
        movement.addItem(movementItem);

        given(movementRepository.findById(movementId)).willReturn(Optional.of(movement));
        MovementCompleteRequest completeRequest = new MovementCompleteRequest("이동 완료 처리");

        // when
        MovementCompleteResponse response = movementService.completeMovement(movementId, completeRequest);

        // then
        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(MovementStatus.COMPLETED);

        // InventoryService 재고 이동 호출 검증
        verify(inventoryService).moveInventory(
                eq(1L),
                eq(10L),
                eq(20L),
                eq(25),
                eq("MV-20260821-00001"),
                eq("이동 완료 처리")
        );
    }

    @Test
    @DisplayName("재고 이동 취소 성공 - CANCELED 상태 변경 및 선점 예약 수량이 원복(releaseInventoryByItemAndLocation)된다")
    void cancelMovement_success() {
        // given
        Long movementId = 1L;
        Item item = new Item();
        ReflectionTestUtils.setField(item, "id", 1L);

        Location fromLoc = new Location();
        ReflectionTestUtils.setField(fromLoc, "id", 10L);

        Location toLoc = new Location();
        ReflectionTestUtils.setField(toLoc, "id", 20L);

        StockMovement movement = StockMovement.create("취소건");
        StockMovementItem movementItem = new StockMovementItem();
        movementItem.setItem(item);
        movementItem.setFromLocation(fromLoc);
        movementItem.setToLocation(toLoc);
        movementItem.setQuantity(10);
        movement.addItem(movementItem);

        given(movementRepository.findById(movementId)).willReturn(Optional.of(movement));

        // when
        movementService.cancelMovement(movementId);

        // then
        assertThat(movement.getStatus()).isEqualTo(MovementStatus.CANCELED);
        verify(inventoryService).releaseInventoryByItemAndLocation(1L, 10L, 10);
    }
}
