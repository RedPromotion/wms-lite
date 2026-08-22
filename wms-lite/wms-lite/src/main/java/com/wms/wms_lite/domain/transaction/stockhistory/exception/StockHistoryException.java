package com.wms.wms_lite.domain.transaction.stockhistory.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class StockHistoryException extends BusinessException {
    public StockHistoryException(StockHistoryErrorCode errorCode) {
        super(errorCode);
    }
}
