package com.wms.wms_lite.domain.user.admin.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum AdminErrorCode implements ErrorCode {
    ADMIN_NOT_FOUND(HttpStatus.NOT_FOUND, "A001", "존재하지 않는 관리자입니다."),
    ADMIN_LOGIN_ID_DUPLICATED(HttpStatus.CONFLICT, "A002", "이미 존재하는 관리자 로그인 아이디입니다."),
    ADMIN_EMAIL_DUPLICATED(HttpStatus.CONFLICT, "A003", "이미 존재하는 관리자 이메일입니다."),
    ADMIN_PASSWORD_INVALID(HttpStatus.BAD_REQUEST, "A004", "관리자 비밀번호가 올바르지 않습니다."),
    ADMIN_PERMISSION_DENIED(HttpStatus.FORBIDDEN, "A005", "관리자 권한이 없습니다."),
    ADMIN_ACCOUNT_LOCKED(HttpStatus.BAD_REQUEST, "A006", "잠긴 계정입니다."),
    ADMIN_ACCOUNT_INACTIVE(HttpStatus.BAD_REQUEST, "A007", "비활성화된 계정입니다.");
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
