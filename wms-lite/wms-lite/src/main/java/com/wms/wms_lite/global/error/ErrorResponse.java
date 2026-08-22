package com.wms.wms_lite.global.error;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(
        String code,
        String message,
        LocalDateTime timestamp,
        List<ValidationErrorResponse> errors
) {
    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(errorCode.getCode(), errorCode.getMessage(), LocalDateTime.now(), List.of());
    }

    public static ErrorResponse of(ErrorCode errorCode, List<ValidationErrorResponse> errors) {
        return new ErrorResponse(errorCode.getCode(), errorCode.getMessage(), LocalDateTime.now(), errors);
    }
}
