package com.wms.wms_lite.domain.master.customer.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class CustomerException extends BusinessException {
    public CustomerException(CustomerErrorCode errorCode) {
        super(errorCode);
    }
}
