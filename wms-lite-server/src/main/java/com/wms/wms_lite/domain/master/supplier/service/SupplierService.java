package com.wms.wms_lite.domain.master.supplier.service;

import com.wms.wms_lite.domain.master.supplier.dto.request.*;
import com.wms.wms_lite.domain.master.supplier.dto.response.*;
import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import com.wms.wms_lite.domain.master.supplier.exception.*;
import com.wms.wms_lite.domain.master.supplier.repository.SupplierRepository;
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
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional
    public SupplierCreateResponse createSupplier(SupplierCreateRequest request) {
        if (supplierRepository.existsByCode(request.code())) {
            throw new SupplierException(SupplierErrorCode.SUPPLIER_CODE_DUPLICATED);
        }
        if (request.businessNo() != null && supplierRepository.existsByBusinessNo(request.businessNo())) {
            throw new SupplierException(SupplierErrorCode.SUPPLIER_BUSINESS_NO_DUPLICATED);
        }

        Supplier supplier = new Supplier();
        supplier.setCode(request.code());
        supplier.setName(request.name());
        supplier.setBusinessNo(request.businessNo());
        supplier.setCeoName(request.ceoName());
        supplier.setPhone(request.phone());
        supplier.setEmail(request.email());
        supplier.setAddress(request.address());
        supplier.setDescription(request.description());

        Supplier saved = supplierRepository.save(supplier);
        return SupplierCreateResponse.from(saved);
    }

    public SupplierResponse getSupplier(Long id) {
        return SupplierResponse.from(findSupplier(id));
    }

    public PageResponse<SupplierSummaryResponse> getSupplierList(SupplierSearchRequest request, Pageable pageable) {
        Page<Supplier> page = supplierRepository.searchSuppliers(request.keyword(), request.status(), pageable);
        return PageResponse.from(page.map(SupplierSummaryResponse::from));
    }

    @Transactional
    public SupplierUpdateResponse updateSupplier(Long id, SupplierUpdateRequest request) {
        Supplier supplier = findSupplier(id);
        if (request.name() != null)
            supplier.setName(request.name());
        if (request.businessNo() != null)
            supplier.setBusinessNo(request.businessNo());
        if (request.ceoName() != null)
            supplier.setCeoName(request.ceoName());
        if (request.phone() != null)
            supplier.setPhone(request.phone());
        if (request.email() != null)
            supplier.setEmail(request.email());
        if (request.address() != null)
            supplier.setAddress(request.address());
        if (request.description() != null)
            supplier.setDescription(request.description());
        return SupplierUpdateResponse.from(supplier);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = findSupplier(id);
        supplier.markDeleted(SecurityUtils.getCurrentUsername().orElseThrow(() -> new IllegalStateException("Authenticated user not found")));
    }

    @Transactional
    public SupplierResponse changeStatus(Long id, SupplierStatusChangeRequest request) {
        Supplier supplier = findSupplier(id);
        supplier.setStatus(request.status());
        return SupplierResponse.from(supplier);
    }

    public Supplier findSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new SupplierException(SupplierErrorCode.SUPPLIER_NOT_FOUND));
        if (supplier.isDeleted()) {
            throw new SupplierException(SupplierErrorCode.SUPPLIER_NOT_FOUND);
        }
        return supplier;
    }
}
