package com.wms.wms_lite.global.annotation;

import com.wms.wms_lite.global.validator.BusinessNumberValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = BusinessNumberValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface BusinessNumber {
    String message() default "유효하지 않은 사업자등록번호입니다.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
