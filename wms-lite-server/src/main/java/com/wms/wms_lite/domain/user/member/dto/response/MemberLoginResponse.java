package com.wms.wms_lite.domain.user.member.dto.response;

import com.wms.wms_lite.domain.user.member.enums.Department;
import com.wms.wms_lite.domain.user.member.enums.MemberRole;
import java.time.LocalDateTime;

public record MemberLoginResponse(Long memberId, String loginId, String name, Department department, MemberRole role, String accessToken, String refreshToken, LocalDateTime expiresAt) {}
