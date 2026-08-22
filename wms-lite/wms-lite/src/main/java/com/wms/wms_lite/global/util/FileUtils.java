package com.wms.wms_lite.global.util;

import org.springframework.util.StringUtils;

public final class FileUtils {

    private FileUtils() {
    }

    public static String getExtension(String filename) {
        return StringUtils.getFilenameExtension(filename);
    }

    public static String getBaseName(String filename) {
        String extension = getExtension(filename);
        if (extension == null || extension.isBlank()) {
            return filename;
        }
        return filename.substring(0, filename.length() - extension.length() - 1);
    }
}
