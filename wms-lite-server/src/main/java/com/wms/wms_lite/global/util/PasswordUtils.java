package com.wms.wms_lite.global.util;

import com.wms.wms_lite.global.constant.RegexConstants;

public final class PasswordUtils {

    private PasswordUtils() {
    }

    public static boolean isValid(String password) {
        return password != null && password.matches(RegexConstants.PASSWORD);
    }
}
