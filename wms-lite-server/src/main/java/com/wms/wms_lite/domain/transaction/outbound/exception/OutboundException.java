package com.wms.wms_lite.domain.transaction.outbound.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class OutboundException extends BusinessException {
    public OutboundException(OutboundErrorCode errorCode) {
        super(errorCode);
    }
}
