package com.wms.wms_lite.domain.transaction.outbound.service;

import com.wms.wms_lite.domain.master.customer.entity.Customer;
import com.wms.wms_lite.domain.master.customer.entity.DeliveryAddress;
import com.wms.wms_lite.domain.master.customer.repository.CustomerRepository;
import com.wms.wms_lite.domain.master.customer.repository.DeliveryAddressRepository;
import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.repository.ItemRepository;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.master.warehouse.repository.LocationRepository;
import com.wms.wms_lite.domain.transaction.inventory.exception.InventoryErrorCode;
import com.wms.wms_lite.domain.transaction.inventory.exception.InventoryException;
import com.wms.wms_lite.domain.transaction.inventory.service.InventoryService;
import com.wms.wms_lite.domain.transaction.outbound.dto.request.OutboundCompleteRequest;
import com.wms.wms_lite.domain.transaction.outbound.dto.request.OutboundCreateRequest;
import com.wms.wms_lite.domain.transaction.outbound.dto.request.OutboundItemRequest;
import com.wms.wms_lite.domain.transaction.outbound.dto.response.OutboundCompleteResponse;
import com.wms.wms_lite.domain.transaction.outbound.dto.response.OutboundCreateResponse;
import com.wms.wms_lite.domain.transaction.outbound.entity.Outbound;
import com.wms.wms_lite.domain.transaction.outbound.entity.OutboundItem;
import com.wms.wms_lite.domain.transaction.outbound.enums.OutboundStatus;
import com.wms.wms_lite.domain.transaction.outbound.exception.OutboundErrorCode;
import com.wms.wms_lite.domain.transaction.outbound.exception.OutboundException;
import com.wms.wms_lite.domain.transaction.outbound.repository.OutboundRepository;
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
 * [출고 관리 단위 테스트 (OutboundServiceTest)]
 *
 * 주요 검증 항목:
 * 1. createOutbound: 출고 요청 시 가용재고 검증 및 예약 수량(reservedQuantity) 즉시 선점 검증
 * 2. shipOutbound: 출고 확정 시 실재고와 예약 수량 동시 차감(decreaseReservedQuantity) 검증
 * 3. cancelOutbound: 출고 취소 시 선점된 예약 수량 해제(releaseInventory) 검증
 */
@ExtendWith(MockitoExtension.class)
class OutboundServiceTest {

    @Mock
    private OutboundRepository outboundRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private DeliveryAddressRepository deliveryAddressRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private OutboundService outboundService;

    @Test
    @DisplayName("출고 전표 생성 성공 - OB 전표번호 채번 및 재고 예약(reserveInventoryByItemAndLocation)이 실행된다")
    void createOutbound_success() {
        // given
        Long customerId = 1L;
        Long deliveryAddressId = 10L;
        Long itemId = 100L;
        Long locationId = 1000L;

        Customer customer = new Customer();
        customer.setCode("CUST-01");
        customer.setName("고객사 A");
        ReflectionTestUtils.setField(customer, "id", customerId);

        DeliveryAddress address = new DeliveryAddress();
        address.setAddress("서울시 강남구");
        ReflectionTestUtils.setField(address, "id", deliveryAddressId);

        Item item = new Item();
        item.setCode("ITEM-01");
        item.setName("품목 A");
        ReflectionTestUtils.setField(item, "id", itemId);

        Location location = new Location();
        location.setCode("LOC-01");
        location.setName("로케이션 01");
        ReflectionTestUtils.setField(location, "id", locationId);

        OutboundItemRequest itemRequest = new OutboundItemRequest(itemId, locationId, 20);
        OutboundCreateRequest createRequest = new OutboundCreateRequest(customerId, deliveryAddressId, List.of(itemRequest), "출고 요청");

        given(customerRepository.findById(customerId)).willReturn(Optional.of(customer));
        given(deliveryAddressRepository.findById(deliveryAddressId)).willReturn(Optional.of(address));
        given(itemRepository.findById(itemId)).willReturn(Optional.of(item));
        given(locationRepository.findById(locationId)).willReturn(Optional.of(location));
        given(outboundRepository.saveAndFlush(any(Outbound.class))).willAnswer(invocation -> {
            Outbound outbound = invocation.getArgument(0);
            ReflectionTestUtils.setField(outbound, "id", 1L);
            return outbound;
        });

        // when
        OutboundCreateResponse response = outboundService.createOutbound(createRequest);

        // then
        assertThat(response).isNotNull();
        assertThat(response.outboundNo()).startsWith("OB-");
        assertThat(response.status()).isEqualTo(OutboundStatus.REQUESTED);

        // 재고 선점 reserveInventoryByItemAndLocation 호출 검증
        verify(inventoryService).reserveInventoryByItemAndLocation(itemId, locationId, 20);
        verify(outboundRepository).saveAndFlush(any(Outbound.class));
    }

    @Test
    @DisplayName("출고 전표 생성 실패 - 가용 재고 초과 시 OUTBOUND_INSUFFICIENT_INVENTORY 예외가 발생한다")
    void createOutbound_insufficientInventory() {
        // given
        Long customerId = 1L;
        Long deliveryAddressId = 10L;
        Long itemId = 100L;
        Long locationId = 1000L;

        Customer customer = new Customer();
        DeliveryAddress address = new DeliveryAddress();
        Item item = new Item();
        ReflectionTestUtils.setField(item, "id", itemId);
        Location location = new Location();
        ReflectionTestUtils.setField(location, "id", locationId);

        OutboundItemRequest itemRequest = new OutboundItemRequest(itemId, locationId, 999);
        OutboundCreateRequest createRequest = new OutboundCreateRequest(customerId, deliveryAddressId, List.of(itemRequest), "비고");

        given(customerRepository.findById(customerId)).willReturn(Optional.of(customer));
        given(deliveryAddressRepository.findById(deliveryAddressId)).willReturn(Optional.of(address));
        given(itemRepository.findById(itemId)).willReturn(Optional.of(item));
        given(locationRepository.findById(locationId)).willReturn(Optional.of(location));

        // 가용 재고 초과 예외 Mocking
        given(inventoryService.reserveInventoryByItemAndLocation(itemId, locationId, 999))
                .willThrow(new InventoryException(InventoryErrorCode.INVENTORY_RESERVE_EXCEEDED));

        // when & then
        assertThatThrownBy(() -> outboundService.createOutbound(createRequest))
                .isInstanceOf(OutboundException.class)
                .hasMessageContaining(OutboundErrorCode.OUTBOUND_INSUFFICIENT_INVENTORY.getMessage());
    }

    @Test
    @DisplayName("출고 완료 성공 - COMPLETED 상태 변경 및 예약/실재고 동시에 차감(decreaseReservedQuantity)된다")
    void completeOutbound_success() {
        // given
        Long outboundId = 1L;
        Customer customer = new Customer();
        DeliveryAddress address = new DeliveryAddress();
        Item item = new Item();
        ReflectionTestUtils.setField(item, "id", 100L);
        Location location = new Location();
        ReflectionTestUtils.setField(location, "id", 1000L);

        Outbound outbound = Outbound.create(customer, address, "출고 지시");
        outbound.setOutboundNo("OB-20260821-00001");
        OutboundItem outboundItem = new OutboundItem();
        outboundItem.setItem(item);
        outboundItem.setLocation(location);
        outboundItem.setQuantity(15);
        outbound.addItem(outboundItem);

        given(outboundRepository.findById(outboundId)).willReturn(Optional.of(outbound));
        OutboundCompleteRequest completeRequest = new OutboundCompleteRequest("출고 출하 완료");

        // when
        OutboundCompleteResponse response = outboundService.completeOutbound(outboundId, completeRequest);

        // then
        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(OutboundStatus.COMPLETED);

        // 재고 차감 서비스 연동 호출 검증
        verify(inventoryService).decreaseReservedQuantity(
                eq(100L),
                eq(1000L),
                eq(15),
                eq(HistoryType.OUTBOUND),
                eq("OB-20260821-00001"),
                eq("출고 출하 완료")
        );
    }

    @Test
    @DisplayName("출고 취소 성공 - CANCELED 상태 변경 및 선점된 예약 수량이 원복(releaseInventoryByItemAndLocation)된다")
    void cancelOutbound_success() {
        // given
        Long outboundId = 1L;
        Customer customer = new Customer();
        DeliveryAddress address = new DeliveryAddress();
        Item item = new Item();
        ReflectionTestUtils.setField(item, "id", 100L);
        Location location = new Location();
        ReflectionTestUtils.setField(location, "id", 1000L);

        Outbound outbound = Outbound.create(customer, address, "취소 건");
        OutboundItem outboundItem = new OutboundItem();
        outboundItem.setItem(item);
        outboundItem.setLocation(location);
        outboundItem.setQuantity(10);
        outbound.addItem(outboundItem);

        given(outboundRepository.findById(outboundId)).willReturn(Optional.of(outbound));

        // when
        outboundService.cancelOutbound(outboundId);

        // then
        assertThat(outbound.getStatus()).isEqualTo(OutboundStatus.CANCELED);

        // 예약 수량 해제 연동 호출 검증
        verify(inventoryService).releaseInventoryByItemAndLocation(100L, 1000L, 10);
    }

    @Test
    @DisplayName("출고 단건 조회 실패 - 존재하지 않는 ID 시 예외가 발생한다")
    void getOutbound_notFound() {
        // given
        Long notFoundId = 999L;
        given(outboundRepository.findById(notFoundId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> outboundService.getOutbound(notFoundId))
                .isInstanceOf(OutboundException.class)
                .hasMessageContaining(OutboundErrorCode.OUTBOUND_NOT_FOUND.getMessage());
    }
}
