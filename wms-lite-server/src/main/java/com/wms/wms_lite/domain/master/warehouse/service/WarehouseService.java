package com.wms.wms_lite.domain.master.warehouse.service;

import com.wms.wms_lite.domain.master.warehouse.dto.request.*;
import com.wms.wms_lite.domain.master.warehouse.dto.response.*;
import com.wms.wms_lite.domain.master.warehouse.entity.Warehouse;
import com.wms.wms_lite.domain.master.warehouse.exception.*;
import com.wms.wms_lite.domain.master.warehouse.repository.WarehouseRepository;
import com.wms.wms_lite.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wms.wms_lite.global.util.SecurityUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Transactional
    public WarehouseCreateResponse createWarehouse(WarehouseCreateRequest request) {
        if (warehouseRepository.existsByCode(request.code())) {
            throw new WarehouseException(WarehouseErrorCode.WAREHOUSE_CODE_DUPLICATED);
        }
        Warehouse warehouse = new Warehouse();
        warehouse.setCode(request.code());
        warehouse.setName(request.name());
        warehouse.setPhone(request.phone());
        warehouse.setManager(request.manager());
        warehouse.setAddress(request.address());
        warehouse.setDescription(request.description());
        return WarehouseCreateResponse.from(warehouseRepository.save(warehouse));
    }

    public WarehouseResponse getWarehouse(Long id) {
        return WarehouseResponse.from(findWarehouse(id));
    }

    public PageResponse<WarehouseSummaryResponse> getWarehouseList(WarehouseSearchRequest request, Pageable pageable) {
        Page<Warehouse> page = warehouseRepository.searchWarehouses(request.keyword(), request.status(), pageable);
        return PageResponse.from(page.map(WarehouseSummaryResponse::from));
    }

    @Transactional
    public WarehouseUpdateResponse updateWarehouse(Long id, WarehouseUpdateRequest request) {
        Warehouse warehouse = findWarehouse(id);
        if (request.name() != null)
            warehouse.setName(request.name());
        if (request.phone() != null)
            warehouse.setPhone(request.phone());
        if (request.manager() != null)
            warehouse.setManager(request.manager());
        if (request.address() != null)
            warehouse.setAddress(request.address());
        if (request.description() != null)
            warehouse.setDescription(request.description());
        return WarehouseUpdateResponse.from(warehouse);
    }

    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = findWarehouse(id);
        warehouse.markDeleted(SecurityUtils.getCurrentUsername().orElseThrow(() -> new IllegalStateException("Authenticated user not found")));
    }

    @Transactional
    public WarehouseResponse changeStatus(Long id, WarehouseStatusChangeRequest request) {
        Warehouse warehouse = findWarehouse(id);
        warehouse.setStatus(request.status());
        return WarehouseResponse.from(warehouse);
    }

    public Warehouse findWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new WarehouseException(WarehouseErrorCode.WAREHOUSE_NOT_FOUND));
        if (warehouse.isDeleted()) {
            throw new WarehouseException(WarehouseErrorCode.WAREHOUSE_NOT_FOUND);
        }
        return warehouse;
    }
}
