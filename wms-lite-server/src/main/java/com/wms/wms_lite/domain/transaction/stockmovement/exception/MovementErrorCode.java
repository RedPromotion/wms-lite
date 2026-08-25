package com.wms.wms_lite.domain.transaction.stockmovement.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum MovementErrorCode implements ErrorCode {
    MOVEMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "MV001", "존재하지 않는 재고 이동 요청입니다."),
    MOVEMENT_NO_DUPLICATED(HttpStatus.CONFLICT, "MV002", "이미 존재하는 이동 번호입니다."),
    MOVEMENT_ALREADY_COMPLETED(HttpStatus.BAD_REQUEST, "MV003", "이미 완료된 이동 요청입니다."),
    MOVEMENT_ALREADY_CANCELED(HttpStatus.BAD_REQUEST, "MV004", "이미 취소된 이동 요청입니다."),
    MOVEMENT_INVALID_STATUS(HttpStatus.BAD_REQUEST, "MV005", "유효하지 않은 이동 상태입니다."),
    MOVEMENT_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "MV006", "존재하지 않는 품목입니다."),
    MOVEMENT_FROM_LOCATION_NOT_FOUND(HttpStatus.NOT_FOUND, "MV007", "존재하지 않는 출발 로케이션입니다."),
    MOVEMENT_TO_LOCATION_NOT_FOUND(HttpStatus.NOT_FOUND, "MV008", "존재하지 않는 도착 로케이션입니다."),
    MOVEMENT_SAME_LOCATION(HttpStatus.BAD_REQUEST, "MV009", "출발지와 도착지가 같을 수 없습니다."),
    MOVEMENT_INSUFFICIENT_INVENTORY(HttpStatus.BAD_REQUEST, "MV010", "이동할 재고 수량이 부족합니다."),
    MOVEMENT_CREATE_FAILED(HttpStatus.BAD_REQUEST, "MV011", "이동 요청 등록에 실패했습니다."),
    MOVEMENT_COMPLETE_FAILED(HttpStatus.BAD_REQUEST, "MV012", "이동 완료 처리에 실패했습니다."),
    MOVEMENT_CANCEL_FAILED(HttpStatus.BAD_REQUEST, "MV013", "이동 취소 처리에 실패했습니다.");

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
