package com.wms.wms_lite.domain.master.item.controller;

import com.wms.wms_lite.domain.master.item.dto.request.ItemCategoryCreateRequest;
import com.wms.wms_lite.domain.master.item.dto.request.ItemCategoryUpdateRequest;
import com.wms.wms_lite.domain.master.item.dto.response.ItemCategoryResponse;
import com.wms.wms_lite.domain.master.item.service.ItemCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/item-categories")
public class ItemCategoryController {

    private final ItemCategoryService itemCategoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public ItemCategoryResponse createCategory(@Valid @RequestBody ItemCategoryCreateRequest request) {
        return itemCategoryService.createCategory(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public List<ItemCategoryResponse> getCategoryList() {
        return itemCategoryService.getCategoryList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public ItemCategoryResponse getCategory(@PathVariable Long id) {
        return itemCategoryService.getCategory(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public ItemCategoryResponse updateCategory(@PathVariable Long id, @Valid @RequestBody ItemCategoryUpdateRequest request) {
        return itemCategoryService.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public void deleteCategory(@PathVariable Long id) {
        itemCategoryService.deleteCategory(id);
    }
}
