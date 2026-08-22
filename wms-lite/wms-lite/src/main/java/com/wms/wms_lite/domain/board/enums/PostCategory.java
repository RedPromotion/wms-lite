package com.wms.wms_lite.domain.board.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PostCategory {
    GENERAL("일반"),
    QUESTION("질문/문의"),
    SUGGESTION("개선요청"),
    ISSUE("이슈제보");

    private final String description;
}
