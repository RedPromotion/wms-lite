package com.wms.wms_lite.domain.transaction.stockmovement.controller;

import com.wms.wms_lite.domain.transaction.stockmovement.dto.request.MovementCompleteRequest;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.request.MovementCreateRequest;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.request.MovementSearchRequest;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.response.MovementCompleteResponse;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.response.MovementCreateResponse;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.response.MovementResponse;
import com.wms.wms_lite.domain.transaction.stockmovement.dto.response.MovementSummaryResponse;
import com.wms.wms_lite.domain.transaction.stockmovement.service.MovementService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/movements")
public class MovementController {

    private final MovementService movementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public MovementCreateResponse createMovement(@Valid @RequestBody MovementCreateRequest request) {
        return movementService.createMovement(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public MovementResponse getMovement(@PathVariable Long id) {
        return movementService.getMovement(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<MovementSummaryResponse> getMovementList(
            MovementSearchRequest request,
            Pageable pageable) {
        return movementService.getMovementList(request, pageable);
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public MovementCompleteResponse completeMovement(
            @PathVariable Long id,
            @Valid @RequestBody MovementCompleteRequest request) {
        return movementService.completeMovement(id, request);
    }

    @PutMapping("/{id}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public void cancelMovement(@PathVariable Long id) {
        movementService.cancelMovement(id);
    }
}
