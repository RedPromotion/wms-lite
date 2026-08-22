package com.wms.wms_lite.domain.board.controller;

import com.wms.wms_lite.domain.board.dto.*;
import com.wms.wms_lite.domain.board.service.NoticeService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notices")
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<NoticeSummaryResponse> getNoticeList(
            @RequestParam(required = false) String keyword,
            Pageable pageable) {
        return noticeService.getNoticeList(keyword, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public NoticeResponse getNotice(@PathVariable Long id) {
        return noticeService.getNotice(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public NoticeResponse createNotice(@Valid @RequestBody NoticeCreateRequest request) {
        return noticeService.createNotice(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public NoticeResponse updateNotice(
            @PathVariable Long id,
            @Valid @RequestBody NoticeUpdateRequest request) {
        return noticeService.updateNotice(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public void deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public NoticeCommentResponse createComment(
            @PathVariable Long id,
            @Valid @RequestBody NoticeCommentRequest request) {
        return noticeService.createComment(id, request);
    }

    @DeleteMapping("/{noticeId}/comments/{commentId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public void deleteComment(
            @PathVariable Long noticeId,
            @PathVariable Long commentId) {
        noticeService.deleteComment(noticeId, commentId);
    }
}
