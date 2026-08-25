package com.wms.wms_lite.domain.user.member.dto.response;

import com.wms.wms_lite.domain.user.enums.AccountStatus;
import com.wms.wms_lite.domain.user.member.entity.Member;
import com.wms.wms_lite.domain.user.member.enums.Department;
import com.wms.wms_lite.domain.user.member.enums.MemberRole;
import java.time.LocalDateTime;

public record MemberResponse(Long id, String loginId, String name, String phone, String email, Department department, MemberRole role, AccountStatus status, LocalDateTime lastLoginAt, Integer loginFailCount, Boolean passwordExpired, LocalDateTime createdAt, LocalDateTime updatedAt) { public static MemberResponse from(Member member){ return new MemberResponse(member.getId(), member.getLoginId(), member.getName(), member.getPhone(), member.getEmail(), member.getDepartment(), member.getRole(), member.getStatus(), member.getLastLoginAt(), member.getLoginFailCount(), member.getPasswordExpired(), member.getCreatedAt(), member.getUpdatedAt()); } }
