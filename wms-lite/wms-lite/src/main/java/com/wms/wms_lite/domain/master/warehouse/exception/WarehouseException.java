package com.wms.wms_lite.domain.master.warehouse.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class WarehouseException extends BusinessException {
    public WarehouseException(WarehouseErrorCode errorCode) {
        super(errorCode);
    }
}
