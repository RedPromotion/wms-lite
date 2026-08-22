package com.wms.wms_lite.domain.transaction.inbound.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class InboundException extends BusinessException {
    public InboundException(InboundErrorCode errorCode) {
        super(errorCode);
    }
}
