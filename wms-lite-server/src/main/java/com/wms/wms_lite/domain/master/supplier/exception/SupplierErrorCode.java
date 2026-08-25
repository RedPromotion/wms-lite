package com.wms.wms_lite.domain.master.supplier.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum SupplierErrorCode implements ErrorCode {
    SUPPLIER_NOT_FOUND(HttpStatus.NOT_FOUND, "S001", "존재하지 않는 공급업체입니다."),
    SUPPLIER_CODE_DUPLICATED(HttpStatus.CONFLICT, "S002", "이미 존재하는 공급업체 코드입니다."),
    SUPPLIER_BUSINESS_NO_DUPLICATED(HttpStatus.CONFLICT, "S003", "이미 존재하는 사업자등록번호입니다."),
    SUPPLIER_STATUS_INVALID(HttpStatus.BAD_REQUEST, "S004", "공급업체 상태가 올바르지 않습니다.");

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
