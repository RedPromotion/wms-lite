package com.wms.wms_lite.domain.user.member.dto.response;

import com.wms.wms_lite.domain.user.member.entity.LoginHistory;
import java.time.LocalDateTime;

public record LoginHistoryResponse(
        Long id,
        String loginId,
        String ipAddress,
        String userAgent,
        String status,
        LocalDateTime loginAt
) {
    public static LoginHistoryResponse from(LoginHistory history) {
        return new LoginHistoryResponse(
                history.getId(),
                history.getLoginId(),
                history.getIpAddress(),
                history.getUserAgent(),
                history.getStatus(),
                history.getLoginAt()
        );
    }
}
