package com.wms.wms_lite.domain.master.warehouse.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum WarehouseErrorCode implements ErrorCode {
    WAREHOUSE_NOT_FOUND(HttpStatus.NOT_FOUND, "W001", "존재하지 않는 창고입니다."),
    WAREHOUSE_CODE_DUPLICATED(HttpStatus.CONFLICT, "W002", "이미 존재하는 창고 코드입니다."),
    LOCATION_NOT_FOUND(HttpStatus.NOT_FOUND, "L001", "존재하지 않는 위치입니다."),
    LOCATION_CODE_DUPLICATED(HttpStatus.CONFLICT, "L002", "이미 존재하는 위치 코드입니다.");

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
