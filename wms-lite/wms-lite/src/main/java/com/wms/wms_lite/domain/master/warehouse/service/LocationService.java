package com.wms.wms_lite.domain.master.warehouse.service;

import com.wms.wms_lite.domain.master.warehouse.dto.request.*;
import com.wms.wms_lite.domain.master.warehouse.dto.response.*;
import com.wms.wms_lite.domain.master.warehouse.entity.*;
import com.wms.wms_lite.domain.master.warehouse.exception.*;
import com.wms.wms_lite.domain.master.warehouse.repository.LocationRepository;
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
public class LocationService {

    private final LocationRepository locationRepository;
    private final WarehouseService warehouseService;

    @Transactional
    public LocationCreateResponse createLocation(Long warehouseId, LocationCreateRequest request) {
        if (locationRepository.existsByCode(request.code())) {
            throw new WarehouseException(WarehouseErrorCode.LOCATION_CODE_DUPLICATED);
        }
        Warehouse warehouse = warehouseService.findWarehouse(warehouseId);
        Location location = new Location();
        location.setWarehouse(warehouse);
        location.setCode(request.code());
        location.setName(request.name());
        location.setXAxis(request.xAxis());
        location.setYAxis(request.yAxis());
        location.setZAxis(request.zAxis());
        location.setDescription(request.description());
        return LocationCreateResponse.from(locationRepository.save(location));
    }

    public LocationResponse getLocation(Long id) {
        return LocationResponse.from(findLocation(id));
    }

    public PageResponse<LocationSummaryResponse> getLocationList(Long warehouseId, Pageable pageable) {
        Page<Location> page = locationRepository.findByWarehouseId(warehouseId, pageable);
        return PageResponse.from(page.map(LocationSummaryResponse::from));
    }

    @Transactional
    public LocationUpdateResponse updateLocation(Long id, LocationUpdateRequest request) {
        Location location = findLocation(id);
        if (request.name() != null) location.setName(request.name());
        if (request.xAxis() != null) location.setXAxis(request.xAxis());
        if (request.yAxis() != null) location.setYAxis(request.yAxis());
        if (request.zAxis() != null) location.setZAxis(request.zAxis());
        if (request.description() != null) location.setDescription(request.description());
        return LocationUpdateResponse.from(location);
    }

    @Transactional
    public void deleteLocation(Long id) {
        Location location = findLocation(id);
        location.markDeleted(SecurityUtils.getCurrentUsername().orElseThrow(() -> new IllegalStateException("Authenticated user not found")));
    }

    @Transactional
    public LocationResponse changeStatus(Long id, LocationStatusChangeRequest request) {
        Location location = findLocation(id);
        location.setStatus(request.status());
        return LocationResponse.from(location);
    }

    public Location findLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new WarehouseException(WarehouseErrorCode.LOCATION_NOT_FOUND));
        if (location.isDeleted()) {
            throw new WarehouseException(WarehouseErrorCode.LOCATION_NOT_FOUND);
        }
        return location;
    }
}
