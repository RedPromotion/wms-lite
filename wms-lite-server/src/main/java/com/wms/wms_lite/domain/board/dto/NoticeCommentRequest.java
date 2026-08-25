package com.wms.wms_lite.domain.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NoticeCommentRequest {

    @NotBlank(message = "댓글 내용은 필수 입력 항목입니다.")
    private String content;
}
