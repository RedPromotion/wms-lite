package com.wms.wms_lite.domain.board.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum BoardErrorCode implements ErrorCode {
    NOTICE_NOT_FOUND(HttpStatus.NOT_FOUND, "BD001", "존재하지 않는 공지사항입니다."),
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "BD002", "존재하지 않는 게시글입니다."),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "BD003", "존재하지 않는 댓글입니다."),
    UNAUTHORIZED_ACTION(HttpStatus.FORBIDDEN, "BD004", "해당 작업에 대한 권한이 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
