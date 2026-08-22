package com.wms.wms_lite.domain.user.member.dto.request;

import com.wms.wms_lite.domain.user.member.enums.Department;
import jakarta.validation.constraints.NotNull;

public record MemberDepartmentChangeRequest(@NotNull Department department) {}
