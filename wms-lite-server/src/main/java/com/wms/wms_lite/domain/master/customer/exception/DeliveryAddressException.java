package com.wms.wms_lite.domain.master.customer.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class DeliveryAddressException extends BusinessException {
    public DeliveryAddressException(DeliveryAddressErrorCode errorCode) {
        super(errorCode);
    }
}
