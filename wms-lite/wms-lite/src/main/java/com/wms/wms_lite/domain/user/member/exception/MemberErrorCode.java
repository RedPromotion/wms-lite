package com.wms.wms_lite.domain.user.member.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum MemberErrorCode implements ErrorCode {
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "M001", "존재하지 않는 사용자입니다."),
    MEMBER_LOGIN_ID_DUPLICATED(HttpStatus.CONFLICT, "M002", "이미 존재하는 사용자 로그인 아이디입니다."),
    MEMBER_EMAIL_DUPLICATED(HttpStatus.CONFLICT, "M003", "이미 존재하는 사용자 이메일입니다."),
    MEMBER_PASSWORD_INVALID(HttpStatus.BAD_REQUEST, "M004", "사용자 비밀번호가 올바르지 않습니다."),
    MEMBER_PERMISSION_DENIED(HttpStatus.FORBIDDEN, "M005", "사용자 권한이 없습니다."),
    MEMBER_STATUS_INVALID(HttpStatus.BAD_REQUEST, "M006", "사용자 상태가 올바르지 않습니다."),
    MEMBER_ACCOUNT_LOCKED(HttpStatus.BAD_REQUEST, "M007", "잠긴 계정입니다."),
    MEMBER_ACCOUNT_INACTIVE(HttpStatus.BAD_REQUEST, "M008", "비활성화된 계정입니다.");
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
