package com.wms.wms_lite.domain.user.member.dto.response;

import com.wms.wms_lite.domain.user.member.entity.Member;
import com.wms.wms_lite.domain.user.member.enums.Department;
import com.wms.wms_lite.domain.user.member.enums.MemberRole;
import java.time.LocalDateTime;

public record MemberCreateResponse(Long id, String loginId, String name, Department department, MemberRole role, LocalDateTime createdAt) { public static MemberCreateResponse from(Member member){ return new MemberCreateResponse(member.getId(), member.getLoginId(), member.getName(), member.getDepartment(), member.getRole(), member.getCreatedAt()); } }
