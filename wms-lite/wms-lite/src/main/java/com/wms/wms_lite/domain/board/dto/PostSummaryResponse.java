package com.wms.wms_lite.domain.board.dto;

import com.wms.wms_lite.domain.board.entity.Post;
import com.wms.wms_lite.domain.board.enums.PostCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostSummaryResponse {
    private Long id;
    private String title;
    private PostCategory category;
    private String categoryDescription;
    private boolean isSecret;
    private Integer viewCount;
    private Integer commentCount;
    private String createdBy;
    private LocalDateTime createdAt;

    public static PostSummaryResponse from(Post post) {
        int commentCnt = (int) post.getComments().stream().filter(c -> c.getDeletedAt() == null).count();

        return PostSummaryResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .category(post.getCategory())
                .categoryDescription(post.getCategory() != null ? post.getCategory().getDescription() : "")
                .isSecret(post.isSecret())
                .viewCount(post.getViewCount())
                .commentCount(commentCnt)
                .createdBy(post.getCreatedBy())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
