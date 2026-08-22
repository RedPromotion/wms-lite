package com.wms.wms_lite.domain.user.member.dto.request;

import com.wms.wms_lite.domain.user.member.enums.Department;
import jakarta.validation.constraints.Email;

public record MemberUpdateRequest(String name, String phone, @Email String email, Department department) {}
