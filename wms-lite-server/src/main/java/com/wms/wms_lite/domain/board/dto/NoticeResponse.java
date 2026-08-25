package com.wms.wms_lite.domain.board.dto;

import com.wms.wms_lite.domain.board.entity.Notice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeResponse {
    private Long id;
    private String title;
    private String content;
    private boolean isPinned;
    private boolean isPopup;
    private Integer viewCount;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<NoticeCommentResponse> comments;

    public static NoticeResponse from(Notice notice) {
        List<NoticeCommentResponse> commentDtos = notice.getComments().stream()
                .filter(c -> c.getDeletedAt() == null)
                .map(NoticeCommentResponse::from)
                .collect(Collectors.toList());

        return NoticeResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .isPinned(notice.isPinned())
                .isPopup(notice.isPopup())
                .viewCount(notice.getViewCount())
                .createdBy(notice.getCreatedBy())
                .createdAt(notice.getCreatedAt())
                .comments(commentDtos)
                .build();
    }
}
