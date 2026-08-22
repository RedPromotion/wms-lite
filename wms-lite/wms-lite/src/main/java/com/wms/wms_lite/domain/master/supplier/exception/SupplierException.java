package com.wms.wms_lite.domain.master.supplier.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class SupplierException extends BusinessException {
    public SupplierException(SupplierErrorCode errorCode) {
        super(errorCode);
    }
}
