package com.wms.wms_lite.domain.master.item.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum ItemErrorCode implements ErrorCode {
    ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "I001", "존재하지 않는 품목입니다."),
    ITEM_CODE_DUPLICATED(HttpStatus.CONFLICT, "I002", "이미 존재하는 품목 코드입니다."),
    ITEM_BARCODE_DUPLICATED(HttpStatus.CONFLICT, "I003", "이미 존재하는 바코드입니다."),
    ITEM_CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "I004", "존재하지 않는 품목 카테고리입니다."),
    ITEM_SUPPLIER_NOT_FOUND(HttpStatus.NOT_FOUND, "I005", "존재하지 않는 공급업체입니다."),
    ITEM_ALREADY_ACTIVE(HttpStatus.BAD_REQUEST, "I006", "이미 사용 중인 품목입니다."),
    ITEM_ALREADY_INACTIVE(HttpStatus.BAD_REQUEST, "I007", "이미 미사용 중인 품목입니다."),
    ITEM_STATUS_INVALID(HttpStatus.BAD_REQUEST, "I008", "유효하지 않은 품목 상태입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override public HttpStatus getHttpStatus() { return httpStatus; }
    @Override public String getCode() { return code; }
    @Override public String getMessage() { return message; }
}
