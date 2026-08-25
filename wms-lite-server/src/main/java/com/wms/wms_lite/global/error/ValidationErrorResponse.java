package com.wms.wms_lite.global.error;

public record ValidationErrorResponse(
        String field,
        Object rejectedValue,
        String message
) {
}
