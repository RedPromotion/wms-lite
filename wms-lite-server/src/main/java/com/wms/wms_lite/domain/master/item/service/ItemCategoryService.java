package com.wms.wms_lite.domain.master.item.service;

import com.wms.wms_lite.domain.master.item.dto.request.ItemCategoryCreateRequest;
import com.wms.wms_lite.domain.master.item.dto.request.ItemCategoryUpdateRequest;
import com.wms.wms_lite.domain.master.item.dto.response.ItemCategoryResponse;
import com.wms.wms_lite.domain.master.item.entity.ItemCategory;
import com.wms.wms_lite.domain.master.item.enums.ItemStatus;
import com.wms.wms_lite.domain.master.item.exception.ItemErrorCode;
import com.wms.wms_lite.domain.master.item.exception.ItemException;
import com.wms.wms_lite.domain.master.item.repository.ItemCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wms.wms_lite.global.util.SecurityUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemCategoryService {

    private final ItemCategoryRepository itemCategoryRepository;

    @Transactional
    public ItemCategoryResponse createCategory(ItemCategoryCreateRequest request) {
        if (itemCategoryRepository.existsByCode(request.code())) {
            throw new ItemException(ItemErrorCode.ITEM_CODE_DUPLICATED);
        }

        ItemCategory category = new ItemCategory();
        category.setCode(request.code());
        category.setName(request.name());
        category.setDescription(request.description());
        category.setStatus(ItemStatus.ACTIVE);

        ItemCategory saved = itemCategoryRepository.save(category);
        return ItemCategoryResponse.from(saved);
    }

    public ItemCategoryResponse getCategory(Long id) {
        ItemCategory category = itemCategoryRepository.findById(id)
                .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_CATEGORY_NOT_FOUND));
        if (category.isDeleted()) {
            throw new ItemException(ItemErrorCode.ITEM_CATEGORY_NOT_FOUND);
        }
        return ItemCategoryResponse.from(category);
    }

    public List<ItemCategoryResponse> getCategoryList() {
        return itemCategoryRepository.findAll().stream()
                .filter(category -> !category.isDeleted())
                .map(ItemCategoryResponse::from)
                .toList();
    }

    @Transactional
    public ItemCategoryResponse updateCategory(Long id, ItemCategoryUpdateRequest request) {
        ItemCategory category = itemCategoryRepository.findById(id)
                .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_CATEGORY_NOT_FOUND));
        if (category.isDeleted()) {
            throw new ItemException(ItemErrorCode.ITEM_CATEGORY_NOT_FOUND);
        }

        category.setName(request.name());
        category.setDescription(request.description());

        return ItemCategoryResponse.from(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        ItemCategory category = itemCategoryRepository.findById(id)
                .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_CATEGORY_NOT_FOUND));
        if (category.isDeleted()) {
            throw new ItemException(ItemErrorCode.ITEM_CATEGORY_NOT_FOUND);
        }
        category.markDeleted(SecurityUtils.getCurrentUsername().orElseThrow(() -> new IllegalStateException("Authenticated user not found")));
    }
}
