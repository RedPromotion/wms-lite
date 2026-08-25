package com.wms.wms_lite.domain.user.member.dto.response;

import com.wms.wms_lite.domain.user.enums.AccountStatus;
import com.wms.wms_lite.domain.user.member.entity.Member;
import com.wms.wms_lite.domain.user.member.enums.Department;
import com.wms.wms_lite.domain.user.member.enums.MemberRole;

public record MemberSummaryResponse(Long id, String loginId, String name, Department department, MemberRole role, AccountStatus status) { public static MemberSummaryResponse from(Member member){ return new MemberSummaryResponse(member.getId(), member.getLoginId(), member.getName(), member.getDepartment(), member.getRole(), member.getStatus()); } }
