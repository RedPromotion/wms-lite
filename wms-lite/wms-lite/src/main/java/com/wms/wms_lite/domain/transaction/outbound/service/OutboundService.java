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
import com.wms.wms_lite.domain.transaction.outbound.dto.request.OutboundSearchRequest;
import com.wms.wms_lite.domain.transaction.outbound.dto.response.OutboundCompleteResponse;
import com.wms.wms_lite.domain.transaction.outbound.dto.response.OutboundCreateResponse;
import com.wms.wms_lite.domain.transaction.outbound.dto.response.OutboundResponse;
import com.wms.wms_lite.domain.transaction.outbound.dto.response.OutboundSummaryResponse;
import com.wms.wms_lite.domain.transaction.outbound.entity.Outbound;
import com.wms.wms_lite.domain.transaction.outbound.entity.OutboundItem;
import com.wms.wms_lite.domain.transaction.outbound.exception.OutboundErrorCode;
import com.wms.wms_lite.domain.transaction.outbound.exception.OutboundException;
import com.wms.wms_lite.domain.transaction.outbound.repository.OutboundRepository;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
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
public class OutboundService {

    private final OutboundRepository outboundRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryAddressRepository deliveryAddressRepository;
    private final ItemRepository itemRepository;
    private final LocationRepository locationRepository;
    private final InventoryService inventoryService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Retryable(retryFor = { DataIntegrityViolationException.class }, maxAttempts = 5, backoff = @Backoff(delay = 100))
    public OutboundCreateResponse createOutbound(OutboundCreateRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new OutboundException(OutboundErrorCode.OUTBOUND_CUSTOMER_NOT_FOUND));
        if (customer.isDeleted()) {
            throw new OutboundException(OutboundErrorCode.OUTBOUND_CUSTOMER_NOT_FOUND);
        }

        DeliveryAddress deliveryAddress = deliveryAddressRepository.findById(request.deliveryAddressId())
                .orElseThrow(() -> new OutboundException(OutboundErrorCode.OUTBOUND_DELIVERY_ADDRESS_NOT_FOUND));

        Outbound outbound = Outbound.create(customer, deliveryAddress, request.description());
        outbound.setOutboundNo(UniqueNoGenerator.generate("OB"));

        for (OutboundItemRequest itemReq : request.items()) {
            Item item = itemRepository.findById(itemReq.itemId())
                    .orElseThrow(() -> new OutboundException(OutboundErrorCode.OUTBOUND_ITEM_NOT_FOUND));
            if (item.isDeleted()) {
                throw new OutboundException(OutboundErrorCode.OUTBOUND_ITEM_NOT_FOUND);
            }

            Location location = locationRepository.findById(itemReq.locationId())
                    .orElseThrow(() -> new OutboundException(OutboundErrorCode.OUTBOUND_LOCATION_NOT_FOUND));
            if (location.isDeleted()) {
                throw new OutboundException(OutboundErrorCode.OUTBOUND_LOCATION_NOT_FOUND);
            }

            // 가용 재고 검증 및 비관적 락 예약 원자적 수행
            try {
                inventoryService.reserveInventoryByItemAndLocation(item.getId(), location.getId(), itemReq.quantity());
            } catch (InventoryException e) {
                if (e.getErrorCode() == InventoryErrorCode.INVENTORY_RESERVE_EXCEEDED
                        || e.getErrorCode() == InventoryErrorCode.INVENTORY_NOT_FOUND) {
                    throw new OutboundException(OutboundErrorCode.OUTBOUND_INSUFFICIENT_INVENTORY);
                }
                throw e;
            }

            OutboundItem outboundItem = new OutboundItem();
            outboundItem.setItem(item);
            outboundItem.setLocation(location);
            outboundItem.setQuantity(itemReq.quantity());

            outbound.addItem(outboundItem);
        }

        // JPA 롤백 마크 및 즉시 DB Unique 제약조건 감지를 위해 saveAndFlush 사용
        try {
            Outbound saved = outboundRepository.saveAndFlush(outbound);
            return OutboundCreateResponse.from(saved);
        } catch (DataIntegrityViolationException e) {
            throw e;
        }
    }

    public OutboundResponse getOutbound(Long id) {
        Outbound outbound = outboundRepository.findById(id)
                .orElseThrow(() -> new OutboundException(OutboundErrorCode.OUTBOUND_NOT_FOUND));
        return OutboundResponse.from(outbound);
    }

    public PageResponse<OutboundSummaryResponse> getOutboundList(OutboundSearchRequest request, Pageable pageable) {
        Page<Outbound> outbounds = outboundRepository.searchOutbounds(
                request.customerId(),
                request.status(),
                request.keyword(),
                pageable);
        return PageResponse.from(outbounds.map(OutboundSummaryResponse::from));
    }

    @Transactional
    public OutboundCompleteResponse completeOutbound(Long id, OutboundCompleteRequest request) {
        Outbound outbound = outboundRepository.findById(id)
                .orElseThrow(() -> new OutboundException(OutboundErrorCode.OUTBOUND_NOT_FOUND));

        // 각 품목별 재고 차감 및 예약 해제 처리 (원자적 처리 메서드 사용)
        for (OutboundItem outboundItem : outbound.getItems()) {
            inventoryService.decreaseReservedQuantity(
                    outboundItem.getItem().getId(),
                    outboundItem.getLocation().getId(),
                    outboundItem.getQuantity(),
                    HistoryType.OUTBOUND,
                    outbound.getOutboundNo(),
                    request.description());
        }

        outbound.complete(request.description());
        return OutboundCompleteResponse.from(outbound);
    }

    @Transactional
    public void cancelOutbound(Long id) {
        Outbound outbound = outboundRepository.findById(id)
                .orElseThrow(() -> new OutboundException(OutboundErrorCode.OUTBOUND_NOT_FOUND));

        // 예약 수량 원복 (비관적 락으로 동시성 보호)
        for (OutboundItem outboundItem : outbound.getItems()) {
            inventoryService.releaseInventoryByItemAndLocation(
                    outboundItem.getItem().getId(),
                    outboundItem.getLocation().getId(),
                    outboundItem.getQuantity());
        }

        outbound.cancel();
    }
}
