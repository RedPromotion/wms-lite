package com.wms.wms_lite.domain.master.item.service;

import com.wms.wms_lite.domain.master.item.dto.request.ItemCreateRequest;
import com.wms.wms_lite.domain.master.item.dto.request.ItemSearchRequest;
import com.wms.wms_lite.domain.master.item.dto.request.ItemStatusChangeRequest;
import com.wms.wms_lite.domain.master.item.dto.request.ItemUpdateRequest;
import com.wms.wms_lite.domain.master.item.dto.response.ItemCreateResponse;
import com.wms.wms_lite.domain.master.item.dto.response.ItemResponse;
import com.wms.wms_lite.domain.master.item.dto.response.ItemSummaryResponse;
import com.wms.wms_lite.domain.master.item.dto.response.ItemUpdateResponse;
import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.entity.ItemCategory;
import com.wms.wms_lite.domain.master.item.enums.ItemStatus;
import com.wms.wms_lite.domain.master.item.exception.ItemErrorCode;
import com.wms.wms_lite.domain.master.item.exception.ItemException;
import com.wms.wms_lite.domain.master.item.repository.ItemCategoryRepository;
import com.wms.wms_lite.domain.master.item.repository.ItemRepository;
import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import com.wms.wms_lite.domain.master.supplier.repository.SupplierRepository;
import com.wms.wms_lite.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wms.wms_lite.global.util.SecurityUtils;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemCategoryRepository itemCategoryRepository;
    private final SupplierRepository supplierRepository;

    @Transactional
    public ItemCreateResponse createItem(ItemCreateRequest request) {
        if (itemRepository.existsByCode(request.code())) {
            throw new ItemException(ItemErrorCode.ITEM_CODE_DUPLICATED);
        }

        if (StringUtils.hasText(request.barcode()) && itemRepository.existsByBarcode(request.barcode())) {
            throw new ItemException(ItemErrorCode.ITEM_BARCODE_DUPLICATED);
        }

        Supplier supplier = null;
        if (request.supplierId() != null) {
            supplier = supplierRepository.findById(request.supplierId())
                    .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_SUPPLIER_NOT_FOUND));
        }

        ItemCategory category = null;
        if (request.categoryId() != null) {
            category = itemCategoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_CATEGORY_NOT_FOUND));
        }

        Item item = new Item();
        item.setCode(request.code());
        item.setName(request.name());
        item.setBarcode(request.barcode());
        item.setSpecification(request.specification());
        item.setUnit(request.unit());
        item.setStatus(ItemStatus.ACTIVE);
        item.setSupplier(supplier);
        item.setCategory(category);
        item.setDescription(request.description());
        item.setSafetyStockQuantity(request.safetyStockQuantity());

        Item savedItem = itemRepository.save(item);
        return ItemCreateResponse.from(savedItem);
    }

    public ItemResponse getItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_NOT_FOUND));
        if (item.isDeleted()) {
            throw new ItemException(ItemErrorCode.ITEM_NOT_FOUND);
        }
        return ItemResponse.from(item);
    }

    public PageResponse<ItemSummaryResponse> getItemList(ItemSearchRequest request, Pageable pageable) {
        Page<Item> items = itemRepository.searchItems(
                request.keyword(),
                request.supplierId(),
                request.categoryId(),
                request.status(),
                pageable);
        return PageResponse.from(items.map(ItemSummaryResponse::from));
    }

    @Transactional
    public ItemUpdateResponse updateItem(Long id, ItemUpdateRequest request) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_NOT_FOUND));
        if (item.isDeleted()) {
            throw new ItemException(ItemErrorCode.ITEM_NOT_FOUND);
        }

        if (StringUtils.hasText(request.barcode()) && !request.barcode().equals(item.getBarcode())) {
            if (itemRepository.existsByBarcode(request.barcode())) {
                throw new ItemException(ItemErrorCode.ITEM_BARCODE_DUPLICATED);
            }
        }

        Supplier supplier = null;
        if (request.supplierId() != null) {
            supplier = supplierRepository.findById(request.supplierId())
                    .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_SUPPLIER_NOT_FOUND));
        }

        ItemCategory category = null;
        if (request.categoryId() != null) {
            category = itemCategoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_CATEGORY_NOT_FOUND));
        }

        item.setName(request.name());
        item.setBarcode(request.barcode());
        item.setSpecification(request.specification());
        item.setUnit(request.unit());
        item.setSupplier(supplier);
        item.setCategory(category);
        item.setDescription(request.description());
        if (request.safetyStockQuantity() != null) {
            item.setSafetyStockQuantity(request.safetyStockQuantity());
        }

        return ItemUpdateResponse.from(item);
    }

    @Transactional
    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_NOT_FOUND));
        if (item.isDeleted()) {
            throw new ItemException(ItemErrorCode.ITEM_NOT_FOUND);
        }
        item.markDeleted(SecurityUtils.getCurrentUsername().orElseThrow(() -> new IllegalStateException("Authenticated user not found")));
    }

    @Transactional
    public ItemResponse changeStatus(Long id, ItemStatusChangeRequest request) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_NOT_FOUND));
        if (item.isDeleted()) {
            throw new ItemException(ItemErrorCode.ITEM_NOT_FOUND);
        }

        if (item.getStatus() == request.status()) {
            if (request.status() == ItemStatus.ACTIVE) {
                throw new ItemException(ItemErrorCode.ITEM_ALREADY_ACTIVE);
            } else {
                throw new ItemException(ItemErrorCode.ITEM_ALREADY_INACTIVE);
            }
        }

        item.setStatus(request.status());
        return ItemResponse.from(item);
    }
}
