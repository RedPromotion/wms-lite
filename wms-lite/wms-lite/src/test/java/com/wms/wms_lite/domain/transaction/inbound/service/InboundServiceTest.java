package com.wms.wms_lite.domain.transaction.inbound.service;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.repository.ItemRepository;
import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import com.wms.wms_lite.domain.master.supplier.repository.SupplierRepository;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.master.warehouse.repository.LocationRepository;
import com.wms.wms_lite.domain.transaction.inbound.dto.request.InboundCompleteRequest;
import com.wms.wms_lite.domain.transaction.inbound.dto.request.InboundCreateRequest;
import com.wms.wms_lite.domain.transaction.inbound.dto.request.InboundItemRequest;
import com.wms.wms_lite.domain.transaction.inbound.dto.response.InboundCompleteResponse;
import com.wms.wms_lite.domain.transaction.inbound.dto.response.InboundCreateResponse;
import com.wms.wms_lite.domain.transaction.inbound.entity.Inbound;
import com.wms.wms_lite.domain.transaction.inbound.entity.InboundItem;
import com.wms.wms_lite.domain.transaction.inbound.enums.InboundStatus;
import com.wms.wms_lite.domain.transaction.inbound.exception.InboundErrorCode;
import com.wms.wms_lite.domain.transaction.inbound.exception.InboundException;
import com.wms.wms_lite.domain.transaction.inbound.repository.InboundRepository;
import com.wms.wms_lite.domain.transaction.inventory.service.InventoryService;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
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
 * [입고 관리 단위 테스트 (InboundServiceTest)]
 *
 * 주요 검증 항목:
 * 1. createInbound: 입고 전표 자동 생성(IB-yyyyMMdd-XXXXX) 및 항목 유효성 검증
 * 2. confirmInbound: 입고 확정(Putaway) 시 해당 로케이션의 실제 재고(increaseQuantity) 연동 증가 검증
 * 3. cancelInbound: 입고 취소 시 상태 변경(CANCELLED) 및 완료 전표 취소 제한 검증
 */
@ExtendWith(MockitoExtension.class)
class InboundServiceTest {

    @Mock
    private InboundRepository inboundRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private InboundService inboundService;

    @Test
    @DisplayName("입고 전표 생성 성공 - IB 전표번호 채번 및 REQUESTED 상태로 생성된다")
    void createInbound_success() {
        // given
        Long supplierId = 1L;
        Long itemId = 10L;
        Long locationId = 100L;

        Supplier supplier = createSupplier(supplierId, "SUP-001", "테스트 공급사");
        Item item = createItem(itemId, "ITEM-001", "테스트 품목");
        Location location = createLocation(locationId, "LOC-A-1", "A존 1행");

        InboundItemRequest itemRequest = new InboundItemRequest(itemId, locationId, 50);
        InboundCreateRequest createRequest = new InboundCreateRequest(supplierId, List.of(itemRequest), "입고 요청 설명");

        given(supplierRepository.findById(supplierId)).willReturn(Optional.of(supplier));
        given(itemRepository.findById(itemId)).willReturn(Optional.of(item));
        given(locationRepository.findById(locationId)).willReturn(Optional.of(location));
        given(inboundRepository.saveAndFlush(any(Inbound.class))).willAnswer(invocation -> {
            Inbound inbound = invocation.getArgument(0);
            ReflectionTestUtils.setField(inbound, "id", 1L);
            return inbound;
        });

        // when
        InboundCreateResponse response = inboundService.createInbound(createRequest);

        // then
        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(InboundStatus.REQUESTED);
        assertThat(response.inboundNo()).startsWith("IB-");
        verify(inboundRepository).saveAndFlush(any(Inbound.class));
    }

    @Test
    @DisplayName("입고 전표 생성 실패 - 존재하지 않는 공급사 ID 요청 시 예외가 발생한다")
    void createInbound_supplierNotFound() {
        // given
        Long supplierId = 999L;
        InboundCreateRequest request = new InboundCreateRequest(supplierId, List.of(), "비고");

        given(supplierRepository.findById(supplierId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> inboundService.createInbound(request))
                .isInstanceOf(InboundException.class)
                .hasMessageContaining(InboundErrorCode.INBOUND_SUPPLIER_NOT_FOUND.getMessage());
    }

    @Test
    @DisplayName("입고 전표 생성 실패 - 삭제된 품목 요청 시 예외가 발생한다")
    void createInbound_itemDeleted() {
        // given
        Long supplierId = 1L;
        Long itemId = 10L;
        Long locationId = 100L;

        Supplier supplier = createSupplier(supplierId, "SUP-001", "공급사");
        Item deletedItem = createItem(itemId, "ITEM-001", "삭제된 품목");
        deletedItem.markDeleted("test"); // Soft delete 처리

        InboundItemRequest itemRequest = new InboundItemRequest(itemId, locationId, 10);
        InboundCreateRequest createRequest = new InboundCreateRequest(supplierId, List.of(itemRequest), "비고");

        given(supplierRepository.findById(supplierId)).willReturn(Optional.of(supplier));
        given(itemRepository.findById(itemId)).willReturn(Optional.of(deletedItem));

        // when & then
        assertThatThrownBy(() -> inboundService.createInbound(createRequest))
                .isInstanceOf(InboundException.class)
                .hasMessageContaining(InboundErrorCode.INBOUND_ITEM_NOT_FOUND.getMessage());
    }

    @Test
    @DisplayName("입고 완료 성공 - 전표 상태가 COMPLETED로 변경되고 실제 재고 증가(inventoryService.increaseQuantity)가 호출된다")
    void completeInbound_success() {
        // given
        Long inboundId = 1L;
        Supplier supplier = createSupplier(1L, "SUP-001", "공급사 A");
        Item item = createItem(10L, "ITEM-001", "품목 A");
        Location location = createLocation(100L, "LOC-01", "로케이션 01");

        Inbound inbound = Inbound.create(supplier, "입고 전표");
        inbound.setInboundNo("IB-20260821-00001");
        InboundItem inboundItem = new InboundItem();
        inboundItem.setItem(item);
        inboundItem.setLocation(location);
        inboundItem.setQuantity(30);
        inbound.addItem(inboundItem);

        given(inboundRepository.findById(inboundId)).willReturn(Optional.of(inbound));

        InboundCompleteRequest completeRequest = new InboundCompleteRequest("적치 완료");

        // when
        InboundCompleteResponse response = inboundService.completeInbound(inboundId, completeRequest);

        // then
        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(InboundStatus.COMPLETED);
        assertThat(response.completedAt()).isNotNull();

        // InventoryService 재고 증가 연동 호출 검증
        verify(inventoryService).increaseQuantity(
                eq(10L),
                eq(100L),
                eq(30),
                eq(HistoryType.INBOUND),
                eq("IB-20260821-00001"),
                eq("적치 완료"),
                eq("공급사 A"),
                eq("LOC-01"),
                eq("공급사 A")
        );
    }

    @Test
    @DisplayName("입고 완료 실패 - 이미 완료(COMPLETED) 처리된 전표는 다시 완료할 수 없다")
    void completeInbound_alreadyCompleted() {
        // given
        Long inboundId = 1L;
        Supplier supplier = createSupplier(1L, "SUP-001", "공급사 A");
        Inbound inbound = Inbound.create(supplier, "완료 전표");
        inbound.complete("최초 완료"); // 이미 완료 상태로 변경

        given(inboundRepository.findById(inboundId)).willReturn(Optional.of(inbound));
        InboundCompleteRequest request = new InboundCompleteRequest("재완료 시도");

        // when & then
        assertThatThrownBy(() -> inboundService.completeInbound(inboundId, request))
                .isInstanceOf(InboundException.class)
                .hasMessageContaining(InboundErrorCode.INBOUND_ALREADY_COMPLETED.getMessage());
    }

    @Test
    @DisplayName("입고 취소 성공 - REQUESTED 상태 전표가 CANCELED 상태로 정상 변경된다")
    void cancelInbound_success() {
        // given
        Long inboundId = 1L;
        Supplier supplier = createSupplier(1L, "SUP-001", "공급사 A");
        Inbound inbound = Inbound.create(supplier, "취소 대상 전표");

        given(inboundRepository.findById(inboundId)).willReturn(Optional.of(inbound));

        // when
        inboundService.cancelInbound(inboundId);

        // then
        assertThat(inbound.getStatus()).isEqualTo(InboundStatus.CANCELED);
    }

    @Test
    @DisplayName("입고 취소 실패 - COMPLETED 상태 전표는 취소 시도 시 예외가 발생한다")
    void cancelInbound_completedStatus_throwsException() {
        // given
        Long inboundId = 1L;
        Supplier supplier = createSupplier(1L, "SUP-001", "공급사 A");
        Inbound inbound = Inbound.create(supplier, "완료 전표");
        inbound.complete("완료 처리됨");

        given(inboundRepository.findById(inboundId)).willReturn(Optional.of(inbound));

        // when & then
        assertThatThrownBy(() -> inboundService.cancelInbound(inboundId))
                .isInstanceOf(InboundException.class)
                .hasMessageContaining(InboundErrorCode.INBOUND_CANCEL_FAILED.getMessage());
    }

    @Test
    @DisplayName("입고 단건 조회 실패 - 존재하지 않는 입고 ID 요청 시 예외가 발생한다")
    void getInbound_notFound() {
        // given
        Long notFoundId = 999L;
        given(inboundRepository.findById(notFoundId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> inboundService.getInbound(notFoundId))
                .isInstanceOf(InboundException.class)
                .hasMessageContaining(InboundErrorCode.INBOUND_NOT_FOUND.getMessage());
    }

    // --- Helper Fixture Methods ---

    private Supplier createSupplier(Long id, String code, String name) {
        Supplier supplier = new Supplier();
        supplier.setCode(code);
        supplier.setName(name);
        ReflectionTestUtils.setField(supplier, "id", id);
        return supplier;
    }

    private Item createItem(Long id, String code, String name) {
        Item item = new Item();
        item.setCode(code);
        item.setName(name);
        ReflectionTestUtils.setField(item, "id", id);
        return item;
    }

    private Location createLocation(Long id, String code, String name) {
        Location location = new Location();
        location.setCode(code);
        location.setName(name);
        ReflectionTestUtils.setField(location, "id", id);
        return location;
    }
}
