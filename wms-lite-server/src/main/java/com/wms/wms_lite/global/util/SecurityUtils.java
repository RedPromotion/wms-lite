package com.wms.wms_lite.global.util;

import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<String> getCurrentUsername() {
        return getAuthentication()
                .map(authentication -> authentication.getPrincipal())
                .map(SecurityUtils::extractUsername);
    }

    private static Optional<Authentication> getAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        return Optional.of(authentication);
    }

    private static String extractUsername(Object principal) {
        if (principal instanceof String username) {
            return username;
        }
        return principal.toString();
    }
}
