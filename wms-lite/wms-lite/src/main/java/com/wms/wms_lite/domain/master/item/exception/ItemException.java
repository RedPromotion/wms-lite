package com.wms.wms_lite.domain.master.item.exception;

import com.wms.wms_lite.global.error.BusinessException;
import com.wms.wms_lite.global.error.ErrorCode;

public class ItemException extends BusinessException {
    public ItemException(ErrorCode errorCode) {
        super(errorCode);
    }
}
