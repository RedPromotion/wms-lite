package com.wms.wms_lite.domain.user.admin.exception;

import com.wms.wms_lite.global.error.BusinessException;

public class AdminException extends BusinessException {
    public AdminException(AdminErrorCode errorCode) { super(errorCode); }
}
