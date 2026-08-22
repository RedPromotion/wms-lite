package com.wms.wms_lite.domain.board.dto;

import com.wms.wms_lite.domain.board.enums.PostCategory;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PostCreateRequest {

    @NotBlank(message = "게시글 제목은 필수 입력 항목입니다.")
    private String title;

    @NotBlank(message = "게시글 본문 내용은 필수 입력 항목입니다.")
    private String content;

    private PostCategory category = PostCategory.GENERAL;
    private boolean isSecret;
}
