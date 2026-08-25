package com.wms.wms_lite.domain.master.customer.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum CustomerErrorCode implements ErrorCode {
    CUSTOMER_NOT_FOUND(HttpStatus.NOT_FOUND, "CU001", "존재하지 않는 고객입니다."),
    CUSTOMER_CODE_DUPLICATED(HttpStatus.CONFLICT, "CU002", "이미 존재하는 고객 코드입니다."),
    CUSTOMER_BUSINESS_NO_DUPLICATED(HttpStatus.CONFLICT, "CU003", "이미 존재하는 사업자등록번호입니다."),
    CUSTOMER_ALREADY_ACTIVE(HttpStatus.BAD_REQUEST, "CU004", "이미 활성화 상태인 고객입니다."),
    CUSTOMER_ALREADY_INACTIVE(HttpStatus.BAD_REQUEST, "CU005", "이미 비활성화 상태인 고객입니다."),
    CUSTOMER_CREATE_FAILED(HttpStatus.BAD_REQUEST, "CU006", "고객 등록에 실패했습니다."),
    CUSTOMER_UPDATE_FAILED(HttpStatus.BAD_REQUEST, "CU007", "고객 수정에 실패했습니다."),
    CUSTOMER_DELETE_FAILED(HttpStatus.BAD_REQUEST, "CU008", "고객 삭제에 실패했습니다."),
    CUSTOMER_STATUS_INVALID(HttpStatus.BAD_REQUEST, "CU009", "유효하지 않은 고객 상태입니다.");

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
