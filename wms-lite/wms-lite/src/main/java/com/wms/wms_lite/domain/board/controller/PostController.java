package com.wms.wms_lite.domain.board.controller;

import com.wms.wms_lite.domain.board.dto.*;
import com.wms.wms_lite.domain.board.enums.PostCategory;
import com.wms.wms_lite.domain.board.service.PostService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<PostSummaryResponse> getPostList(
            @RequestParam(required = false) PostCategory category,
            @RequestParam(required = false) String keyword,
            Pageable pageable) {
        return postService.getPostList(category, keyword, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PostResponse getPost(@PathVariable Long id) {
        return postService.getPost(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PostResponse createPost(@Valid @RequestBody PostCreateRequest request) {
        return postService.createPost(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PostResponse updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostUpdateRequest request) {
        return postService.updatePost(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public void deletePost(@PathVariable Long id) {
        postService.deletePost(id);
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PostCommentResponse createComment(
            @PathVariable Long id,
            @Valid @RequestBody PostCommentRequest request) {
        return postService.createComment(id, request);
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public void deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId) {
        postService.deleteComment(postId, commentId);
    }
}
