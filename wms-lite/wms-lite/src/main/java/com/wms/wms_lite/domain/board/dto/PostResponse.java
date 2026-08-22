package com.wms.wms_lite.domain.board.dto;

import com.wms.wms_lite.domain.board.entity.Post;
import com.wms.wms_lite.domain.board.enums.PostCategory;
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
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private PostCategory category;
    private String categoryDescription;
    private boolean isSecret;
    private Integer viewCount;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<PostCommentResponse> comments;

    public static PostResponse from(Post post) {
        List<PostCommentResponse> commentDtos = post.getComments().stream()
                .filter(c -> c.getDeletedAt() == null)
                .map(PostCommentResponse::from)
                .collect(Collectors.toList());

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .categoryDescription(post.getCategory() != null ? post.getCategory().getDescription() : "")
                .isSecret(post.isSecret())
                .viewCount(post.getViewCount())
                .createdBy(post.getCreatedBy())
                .createdAt(post.getCreatedAt())
                .comments(commentDtos)
                .build();
    }
}
