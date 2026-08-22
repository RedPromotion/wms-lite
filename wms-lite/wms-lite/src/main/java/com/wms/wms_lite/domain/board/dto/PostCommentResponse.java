package com.wms.wms_lite.domain.board.dto;

import com.wms.wms_lite.domain.board.entity.PostComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostCommentResponse {
    private Long id;
    private Long postId;
    private String content;
    private String createdBy;
    private LocalDateTime createdAt;

    public static PostCommentResponse from(PostComment comment) {
        return PostCommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .content(comment.getContent())
                .createdBy(comment.getCreatedBy())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
