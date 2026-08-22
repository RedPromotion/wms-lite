package com.wms.wms_lite.domain.transaction.stockmovement.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class MovementException extends BusinessException {
    public MovementException(MovementErrorCode errorCode) {
        super(errorCode);
    }
}
