package com.wms.wms_lite.domain.master.customer.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum DeliveryAddressErrorCode implements ErrorCode {
    DELIVERY_ADDRESS_NOT_FOUND(HttpStatus.NOT_FOUND, "DA001", "존재하지 않는 배송지입니다."),
    DELIVERY_ADDRESS_ALREADY_DEFAULT(HttpStatus.BAD_REQUEST, "DA002", "이미 기본 배송지입니다."),
    DELIVERY_ADDRESS_ALREADY_ACTIVE(HttpStatus.BAD_REQUEST, "DA003", "이미 활성화 상태인 배송지입니다."),
    DELIVERY_ADDRESS_ALREADY_INACTIVE(HttpStatus.BAD_REQUEST, "DA004", "이미 비활성화 상태인 배송지입니다."),
    DELIVERY_ADDRESS_CREATE_FAILED(HttpStatus.BAD_REQUEST, "DA005", "배송지 등록에 실패했습니다."),
    DELIVERY_ADDRESS_UPDATE_FAILED(HttpStatus.BAD_REQUEST, "DA006", "배송지 수정에 실패했습니다."),
    DELIVERY_ADDRESS_DELETE_FAILED(HttpStatus.BAD_REQUEST, "DA007", "배송지 삭제에 실패했습니다."),
    DELIVERY_ADDRESS_STATUS_INVALID(HttpStatus.BAD_REQUEST, "DA008", "유효하지 않은 배송지 상태입니다.");

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
