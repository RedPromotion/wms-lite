package com.wms.wms_lite.domain.transaction.inventory.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class InventoryException extends BusinessException {
    public InventoryException(InventoryErrorCode errorCode) {
        super(errorCode);
    }
}
