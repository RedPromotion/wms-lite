package com.wms.wms_lite.domain.master.item.controller;

import com.wms.wms_lite.domain.master.item.dto.request.ItemCreateRequest;
import com.wms.wms_lite.domain.master.item.dto.request.ItemSearchRequest;
import com.wms.wms_lite.domain.master.item.dto.request.ItemStatusChangeRequest;
import com.wms.wms_lite.domain.master.item.dto.request.ItemUpdateRequest;
import com.wms.wms_lite.domain.master.item.dto.response.ItemCreateResponse;
import com.wms.wms_lite.domain.master.item.dto.response.ItemResponse;
import com.wms.wms_lite.domain.master.item.dto.response.ItemSummaryResponse;
import com.wms.wms_lite.domain.master.item.dto.response.ItemUpdateResponse;
import com.wms.wms_lite.domain.master.item.service.ItemService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public ItemCreateResponse createItem(@Valid @RequestBody ItemCreateRequest request) {
        return itemService.createItem(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public ItemResponse getItem(@PathVariable Long id) {
        return itemService.getItem(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<ItemSummaryResponse> getItemList(ItemSearchRequest request, Pageable pageable) {
        return itemService.getItemList(request, pageable);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public ItemUpdateResponse updateItem(@PathVariable Long id, @Valid @RequestBody ItemUpdateRequest request) {
        return itemService.updateItem(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public void deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public ItemResponse changeStatus(@PathVariable Long id, @Valid @RequestBody ItemStatusChangeRequest request) {
        return itemService.changeStatus(id, request);
    }
}
