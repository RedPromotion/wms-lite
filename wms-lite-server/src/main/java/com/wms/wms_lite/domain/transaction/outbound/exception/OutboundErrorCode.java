package com.wms.wms_lite.domain.transaction.outbound.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum OutboundErrorCode implements ErrorCode {
    OUTBOUND_NOT_FOUND(HttpStatus.NOT_FOUND, "OB001", "존재하지 않는 출고 요청입니다."),
    OUTBOUND_NO_DUPLICATED(HttpStatus.CONFLICT, "OB002", "이미 존재하는 출고 번호입니다."),
    OUTBOUND_ALREADY_COMPLETED(HttpStatus.BAD_REQUEST, "OB003", "이미 완료된 출고 요청입니다."),
    OUTBOUND_ALREADY_CANCELED(HttpStatus.BAD_REQUEST, "OB004", "이미 취소된 출고 요청입니다."),
    OUTBOUND_INVALID_STATUS(HttpStatus.BAD_REQUEST, "OB005", "유효하지 않은 출고 상태입니다."),
    OUTBOUND_CUSTOMER_NOT_FOUND(HttpStatus.NOT_FOUND, "OB006", "존재하지 않는 고객입니다."),
    OUTBOUND_DELIVERY_ADDRESS_NOT_FOUND(HttpStatus.NOT_FOUND, "OB007", "존재하지 않는 배송지입니다."),
    OUTBOUND_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "OB008", "존재하지 않는 품목입니다."),
    OUTBOUND_LOCATION_NOT_FOUND(HttpStatus.NOT_FOUND, "OB009", "존재하지 않는 적재 위치입니다."),
    OUTBOUND_INSUFFICIENT_INVENTORY(HttpStatus.BAD_REQUEST, "OB010", "가용 재고가 부족합니다."),
    OUTBOUND_CREATE_FAILED(HttpStatus.BAD_REQUEST, "OB011", "출고 요청 등록에 실패했습니다."),
    OUTBOUND_COMPLETE_FAILED(HttpStatus.BAD_REQUEST, "OB012", "출고 완료 처리에 실패했습니다."),
    OUTBOUND_CANCEL_FAILED(HttpStatus.BAD_REQUEST, "OB013", "출고 취소 처리에 실패했습니다.");

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
