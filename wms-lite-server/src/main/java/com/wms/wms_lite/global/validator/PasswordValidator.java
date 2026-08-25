package com.wms.wms_lite.global.validator;

import com.wms.wms_lite.global.annotation.ValidPassword;
import com.wms.wms_lite.global.util.PasswordUtils;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || value.isBlank() || PasswordUtils.isValid(value);
    }
}
