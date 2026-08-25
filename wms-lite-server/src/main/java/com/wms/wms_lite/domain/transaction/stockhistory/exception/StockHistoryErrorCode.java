package com.wms.wms_lite.domain.transaction.stockhistory.exception;

import com.wms.wms_lite.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum StockHistoryErrorCode implements ErrorCode {
    STOCK_HISTORY_NOT_FOUND(HttpStatus.NOT_FOUND, "SH001", "존재하지 않는 재고 이력입니다."),
    STOCK_HISTORY_CREATE_FAILED(HttpStatus.BAD_REQUEST, "SH002", "재고 이력 등록에 실패했습니다.");

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
