package com.wms.wms_lite.global.constant;

public final class RegexConstants {

    public static final String BUSINESS_NUMBER = "^\\d{3}-?\\d{2}-?\\d{5}$";
    public static final String PHONE_NUMBER = "^(01[016789]|02|0[3-9][0-9])-?\\d{3,4}-?\\d{4}$";
    public static final String PASSWORD = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,64}$";

    private RegexConstants() {
    }
}
