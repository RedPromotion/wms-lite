package com.wms.wms_lite.global.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class DateTimeUtils {

    public static final String DEFAULT_DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_PATTERN);

    private DateTimeUtils() {
    }

    public static String format(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(DEFAULT_FORMATTER);
    }

    public static LocalDateTime parse(String value) {
        return value == null || value.isBlank() ? null : LocalDateTime.parse(value, DEFAULT_FORMATTER);
    }
}
