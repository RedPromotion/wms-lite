package com.wms.wms_lite.domain.transaction.inbound.controller;

import com.wms.wms_lite.domain.transaction.inbound.dto.request.InboundCompleteRequest;
import com.wms.wms_lite.domain.transaction.inbound.dto.request.InboundCreateRequest;
import com.wms.wms_lite.domain.transaction.inbound.dto.request.InboundSearchRequest;
import com.wms.wms_lite.domain.transaction.inbound.dto.response.InboundCompleteResponse;
import com.wms.wms_lite.domain.transaction.inbound.dto.response.InboundCreateResponse;
import com.wms.wms_lite.domain.transaction.inbound.dto.response.InboundResponse;
import com.wms.wms_lite.domain.transaction.inbound.dto.response.InboundSummaryResponse;
import com.wms.wms_lite.domain.transaction.inbound.service.InboundService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inbounds")
public class InboundController {

    private final InboundService inboundService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public InboundCreateResponse createInbound(@Valid @RequestBody InboundCreateRequest request) {
        return inboundService.createInbound(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public InboundResponse getInbound(@PathVariable Long id) {
        return inboundService.getInbound(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<InboundSummaryResponse> getInboundList(
            InboundSearchRequest request,
            Pageable pageable) {
        return inboundService.getInboundList(request, pageable);
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public InboundCompleteResponse completeInbound(
            @PathVariable Long id,
            @Valid @RequestBody InboundCompleteRequest request) {
        return inboundService.completeInbound(id, request);
    }

    @PutMapping("/{id}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public void cancelInbound(@PathVariable Long id) {
        inboundService.cancelInbound(id);
    }
}
