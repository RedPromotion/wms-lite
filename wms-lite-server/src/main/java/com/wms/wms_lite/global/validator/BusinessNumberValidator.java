package com.wms.wms_lite.global.validator;

import com.wms.wms_lite.global.annotation.BusinessNumber;
import com.wms.wms_lite.global.constant.RegexConstants;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class BusinessNumberValidator implements ConstraintValidator<BusinessNumber, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || value.isBlank() || value.matches(RegexConstants.BUSINESS_NUMBER);
    }
}
