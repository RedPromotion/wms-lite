package com.wms.wms_lite.domain.transaction.inventory.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum InventoryErrorCode implements ErrorCode {
    INVENTORY_NOT_FOUND(HttpStatus.NOT_FOUND, "INV001", "존재하지 않는 재고입니다."),
    INVENTORY_ALREADY_EXISTS(HttpStatus.CONFLICT, "INV002", "해당 위치에 품목의 재고가 이미 존재합니다."),
    INVENTORY_INSUFFICIENT_QUANTITY(HttpStatus.BAD_REQUEST, "INV003", "재고 수량이 부족합니다."),
    INVENTORY_INVALID_QUANTITY(HttpStatus.BAD_REQUEST, "INV004", "유효하지 않은 수량입니다."),
    INVENTORY_RESERVE_EXCEEDED(HttpStatus.BAD_REQUEST, "INV005", "예약 가능 수량을 초과하였습니다."),
    INVENTORY_LOCATION_NOT_FOUND(HttpStatus.NOT_FOUND, "INV006", "존재하지 않는 로케이션입니다."),
    INVENTORY_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "INV007", "존재하지 않는 품목입니다."),
    INVENTORY_CREATE_FAILED(HttpStatus.BAD_REQUEST, "INV008", "재고 등록에 실패했습니다."),
    INVENTORY_UPDATE_FAILED(HttpStatus.BAD_REQUEST, "INV009", "재고 수정에 실패했습니다."),
    INVENTORY_ADJUST_FAILED(HttpStatus.BAD_REQUEST, "INV010", "재고 조정에 실패했습니다.");

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
