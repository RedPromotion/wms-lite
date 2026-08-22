package com.wms.wms_lite.global.util;

import org.apache.commons.lang3.RandomStringUtils;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class UniqueNoGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final int RANDOM_STRING_LENGTH = 6; // 경우의 수를 더 넓혀 충돌 방지 (36^6)

    private UniqueNoGenerator() {
    }

    /**
     * 지정된 접두사(Prefix)를 가진 고유 번호를 생성합니다.
     * 예: generate("IB") -> "IB-20260805-A1B2C3"
     *
     * @param prefix 번호 접두사 (예: IB, OB, MV)
     * @return 생성된 고유 번호
     */
    public static String generate(String prefix) {
        String dateStr = LocalDateTime.now().format(DATE_FORMATTER);
        String randomSuffix = RandomStringUtils.secure()
                .nextAlphanumeric(RANDOM_STRING_LENGTH)
                .toUpperCase();
        return String.format("%s-%s-%s", prefix, dateStr, randomSuffix);
    }
}
