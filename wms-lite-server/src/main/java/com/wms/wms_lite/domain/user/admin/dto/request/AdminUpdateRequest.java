package com.wms.wms_lite.domain.user.admin.dto.request;

import jakarta.validation.constraints.Email;

public record AdminUpdateRequest(String name, String phone, @Email String email) {}
