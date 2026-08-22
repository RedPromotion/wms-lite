package com.wms.wms_lite.domain.transaction.inbound.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum InboundErrorCode implements ErrorCode {
    INBOUND_NOT_FOUND(HttpStatus.NOT_FOUND, "IB001", "존재하지 않는 입고 요청입니다."),
    INBOUND_NO_DUPLICATED(HttpStatus.CONFLICT, "IB002", "이미 존재하는 입고 번호입니다."),
    INBOUND_ALREADY_COMPLETED(HttpStatus.BAD_REQUEST, "IB003", "이미 완료된 입고 요청입니다."),
    INBOUND_ALREADY_CANCELED(HttpStatus.BAD_REQUEST, "IB004", "이미 취소된 입고 요청입니다."),
    INBOUND_INVALID_STATUS(HttpStatus.BAD_REQUEST, "IB005", "유효하지 않은 입고 상태입니다."),
    INBOUND_SUPPLIER_NOT_FOUND(HttpStatus.NOT_FOUND, "IB006", "존재하지 않는 공급업체입니다."),
    INBOUND_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "IB007", "존재하지 않는 품목입니다."),
    INBOUND_LOCATION_NOT_FOUND(HttpStatus.NOT_FOUND, "IB008", "존재하지 않는 적재 위치입니다."),
    INBOUND_CREATE_FAILED(HttpStatus.BAD_REQUEST, "IB009", "입고 요청 등록에 실패했습니다."),
    INBOUND_COMPLETE_FAILED(HttpStatus.BAD_REQUEST, "IB010", "입고 완료 처리에 실패했습니다."),
    INBOUND_CANCEL_FAILED(HttpStatus.BAD_REQUEST, "IB011", "입고 취소 처리에 실패했습니다.");

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
