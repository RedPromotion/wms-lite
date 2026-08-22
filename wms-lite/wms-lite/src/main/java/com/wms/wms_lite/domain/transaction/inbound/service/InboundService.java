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
import com.wms.wms_lite.domain.transaction.inbound.dto.request.InboundSearchRequest;
import com.wms.wms_lite.domain.transaction.inbound.dto.response.InboundCompleteResponse;
import com.wms.wms_lite.domain.transaction.inbound.dto.response.InboundCreateResponse;
import com.wms.wms_lite.domain.transaction.inbound.dto.response.InboundResponse;
import com.wms.wms_lite.domain.transaction.inbound.dto.response.InboundSummaryResponse;
import com.wms.wms_lite.domain.transaction.inbound.entity.Inbound;
import com.wms.wms_lite.domain.transaction.inbound.entity.InboundItem;
import com.wms.wms_lite.domain.transaction.inbound.exception.InboundErrorCode;
import com.wms.wms_lite.domain.transaction.inbound.exception.InboundException;
import com.wms.wms_lite.domain.transaction.inbound.repository.InboundRepository;
import com.wms.wms_lite.domain.transaction.inventory.service.InventoryService;
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
public class InboundService {

    private final InboundRepository inboundRepository;
    private final SupplierRepository supplierRepository;
    private final ItemRepository itemRepository;
    private final LocationRepository locationRepository;
    private final InventoryService inventoryService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Retryable(retryFor = { DataIntegrityViolationException.class }, maxAttempts = 5, backoff = @Backoff(delay = 100))
    public InboundCreateResponse createInbound(InboundCreateRequest request) {
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new InboundException(InboundErrorCode.INBOUND_SUPPLIER_NOT_FOUND));

        Inbound inbound = Inbound.create(supplier, request.description());
        inbound.setInboundNo(UniqueNoGenerator.generate("IB"));

        for (InboundItemRequest itemReq : request.items()) {
            Item item = itemRepository.findById(itemReq.itemId())
                    .orElseThrow(() -> new InboundException(InboundErrorCode.INBOUND_ITEM_NOT_FOUND));
            if (item.isDeleted()) {
                throw new InboundException(InboundErrorCode.INBOUND_ITEM_NOT_FOUND);
            }

            Location location = locationRepository.findById(itemReq.locationId())
                    .orElseThrow(() -> new InboundException(InboundErrorCode.INBOUND_LOCATION_NOT_FOUND));
            if (location.isDeleted()) {
                throw new InboundException(InboundErrorCode.INBOUND_LOCATION_NOT_FOUND);
            }

            InboundItem inboundItem = new InboundItem();
            inboundItem.setItem(item);
            inboundItem.setLocation(location);
            inboundItem.setQuantity(itemReq.quantity());

            inbound.addItem(inboundItem);
        }

        // JPA 롤백 마크 및 즉시 DB Unique 제약조건 감지를 위해 saveAndFlush 사용
        try {
            Inbound saved = inboundRepository.saveAndFlush(inbound);
            return InboundCreateResponse.from(saved);
        } catch (DataIntegrityViolationException e) {
            throw e;
        }
    }

    public InboundResponse getInbound(Long id) {
        Inbound inbound = inboundRepository.findById(id)
                .orElseThrow(() -> new InboundException(InboundErrorCode.INBOUND_NOT_FOUND));
        return InboundResponse.from(inbound);
    }

    public PageResponse<InboundSummaryResponse> getInboundList(InboundSearchRequest request, Pageable pageable) {
        Page<Inbound> inbounds = inboundRepository.searchInbounds(
                request.supplierId(),
                request.status(),
                request.keyword(),
                pageable);
        return PageResponse.from(inbounds.map(InboundSummaryResponse::from));
    }

    @Transactional
    public InboundCompleteResponse completeInbound(Long id, InboundCompleteRequest request) {
        Inbound inbound = inboundRepository.findById(id)
                .orElseThrow(() -> new InboundException(InboundErrorCode.INBOUND_NOT_FOUND));

        String supplierName = inbound.getSupplier() != null ? inbound.getSupplier().getName() : "공급업체 미지정";

        // 각 품목별 재고 증가 처리
        for (InboundItem inboundItem : inbound.getItems()) {
            String targetLoc = inboundItem.getLocation() != null ? inboundItem.getLocation().getCode() : "적치 로케이션 미지정";
            inventoryService.increaseQuantity(
                    inboundItem.getItem().getId(),
                    inboundItem.getLocation().getId(),
                    inboundItem.getQuantity(),
                    HistoryType.INBOUND,
                    inbound.getInboundNo(),
                    request.description(),
                    supplierName,
                    targetLoc,
                    supplierName);
        }

        inbound.complete(request.description());
        return InboundCompleteResponse.from(inbound);
    }

    @Transactional
    public void cancelInbound(Long id) {
        Inbound inbound = inboundRepository.findById(id)
                .orElseThrow(() -> new InboundException(InboundErrorCode.INBOUND_NOT_FOUND));

        inbound.cancel();
    }

}
