package com.wms.wms_lite.global.error;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 비즈니스 예외 처리 (예: 사용자 없음, 계정 잠금 등 의도된 예외).
     * 서버 결함이 아닌 비즈니스 규칙 위반이므로 WARN 레벨로 기록합니다.
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        log.warn("[BusinessException] code={}, message={}", errorCode.getCode(), errorCode.getMessage());
        return ResponseEntity.status(errorCode.getHttpStatus()).body(ErrorResponse.of(errorCode));
    }

    /**
     * 입력값 유효성 검증 실패 처리.
     * 클라이언트 요청 오류이므로 WARN 레벨로 기록합니다.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException exception) {
        List<ValidationErrorResponse> errors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toValidationError)
                .toList();

        log.warn("[ValidationException] fields={}", errors.stream()
                .map(e -> e.field() + "(" + e.message() + ")")
                .toList());

        return ResponseEntity
                .badRequest()
                .body(ErrorResponse.of(CommonErrorCode.INVALID_INPUT_VALUE, errors));
    }

    /**
     * 낙관적 락(Optimistic Lock) 동시성 충돌 예외 처리.
     * 동일한 데이터에 대해 동시 변경 요청이 발생한 경우 409 Conflict를 반환합니다.
     */
    @ExceptionHandler({
            org.springframework.orm.ObjectOptimisticLockingFailureException.class,
            jakarta.persistence.OptimisticLockException.class
    })
    public ResponseEntity<ErrorResponse> handleOptimisticLockException(Exception exception) {
        log.warn("[OptimisticLockException] 동시 수정 충돌 발생: {}", exception.getMessage());
        return ResponseEntity
                .status(CommonErrorCode.CONCURRENT_UPDATE_CONFLICT.getHttpStatus())
                .body(ErrorResponse.of(CommonErrorCode.CONCURRENT_UPDATE_CONFLICT));
    }

    /**
     * 예상치 못한 서버 오류 처리 (NPE, DB 오류 등).
     * 반드시 스택 트레이스를 포함하여 ERROR 레벨로 기록해야 원인을 추적할 수 있습니다.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception exception) {
        log.error("[UnhandledException] 예상치 못한 오류 발생", exception);
        return ResponseEntity
                .internalServerError()
                .body(ErrorResponse.of(CommonErrorCode.INTERNAL_SERVER_ERROR));
    }

    private ValidationErrorResponse toValidationError(FieldError fieldError) {
        return new ValidationErrorResponse(
                fieldError.getField(),
                fieldError.getRejectedValue(),
                fieldError.getDefaultMessage());
    }
}
