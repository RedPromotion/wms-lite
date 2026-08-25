package com.wms.wms_lite.domain.board.dto;

import com.wms.wms_lite.domain.board.entity.NoticeComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeCommentResponse {
    private Long id;
    private Long noticeId;
    private String content;
    private String createdBy;
    private LocalDateTime createdAt;

    public static NoticeCommentResponse from(NoticeComment comment) {
        return NoticeCommentResponse.builder()
                .id(comment.getId())
                .noticeId(comment.getNotice().getId())
                .content(comment.getContent())
                .createdBy(comment.getCreatedBy())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
