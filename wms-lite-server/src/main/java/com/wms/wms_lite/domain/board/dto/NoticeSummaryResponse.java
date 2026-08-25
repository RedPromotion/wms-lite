package com.wms.wms_lite.domain.board.dto;

import com.wms.wms_lite.domain.board.entity.Notice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeSummaryResponse {
    private Long id;
    private String title;
    private boolean isPinned;
    private boolean isPopup;
    private Integer viewCount;
    private String createdBy;
    private LocalDateTime createdAt;

    public static NoticeSummaryResponse from(Notice notice) {
        return NoticeSummaryResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .isPinned(notice.isPinned())
                .isPopup(notice.isPopup())
                .viewCount(notice.getViewCount())
                .createdBy(notice.getCreatedBy())
                .createdAt(notice.getCreatedAt())
                .build();
    }
}
