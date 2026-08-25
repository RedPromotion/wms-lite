package com.wms.wms_lite.global.validator;

import com.wms.wms_lite.global.annotation.PhoneNumber;
import com.wms.wms_lite.global.constant.RegexConstants;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<PhoneNumber, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || value.isBlank() || value.matches(RegexConstants.PHONE_NUMBER);
    }
}
