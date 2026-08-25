package com.wms.wms_lite.domain.board.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class BoardException extends BusinessException {
    public BoardException(BoardErrorCode errorCode) {
        super(errorCode);
    }
}
