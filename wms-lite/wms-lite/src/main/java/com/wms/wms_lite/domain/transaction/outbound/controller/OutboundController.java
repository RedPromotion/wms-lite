package com.wms.wms_lite.domain.transaction.outbound.controller;

import com.wms.wms_lite.domain.transaction.outbound.dto.request.OutboundCompleteRequest;
import com.wms.wms_lite.domain.transaction.outbound.dto.request.OutboundCreateRequest;
import com.wms.wms_lite.domain.transaction.outbound.dto.request.OutboundSearchRequest;
import com.wms.wms_lite.domain.transaction.outbound.dto.response.OutboundCompleteResponse;
import com.wms.wms_lite.domain.transaction.outbound.dto.response.OutboundCreateResponse;
import com.wms.wms_lite.domain.transaction.outbound.dto.response.OutboundResponse;
import com.wms.wms_lite.domain.transaction.outbound.dto.response.OutboundSummaryResponse;
import com.wms.wms_lite.domain.transaction.outbound.service.OutboundService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/outbounds")
public class OutboundController {

    private final OutboundService outboundService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public OutboundCreateResponse createOutbound(@Valid @RequestBody OutboundCreateRequest request) {
        return outboundService.createOutbound(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public OutboundResponse getOutbound(@PathVariable Long id) {
        return outboundService.getOutbound(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<OutboundSummaryResponse> getOutboundList(
            OutboundSearchRequest request,
            Pageable pageable) {
        return outboundService.getOutboundList(request, pageable);
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public OutboundCompleteResponse completeOutbound(
            @PathVariable Long id,
            @Valid @RequestBody OutboundCompleteRequest request) {
        return outboundService.completeOutbound(id, request);
    }

    @PutMapping("/{id}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public void cancelOutbound(@PathVariable Long id) {
        outboundService.cancelOutbound(id);
    }
}
