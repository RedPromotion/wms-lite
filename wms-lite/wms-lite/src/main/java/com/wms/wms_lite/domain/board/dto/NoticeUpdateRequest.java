package com.wms.wms_lite.domain.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NoticeUpdateRequest {

    @NotBlank(message = "공지사항 제목은 필수 입력 항목입니다.")
    private String title;

    @NotBlank(message = "공지사항 본문 내용은 필수 입력 항목입니다.")
    private String content;

    private boolean isPinned;
    private boolean isPopup;
}
