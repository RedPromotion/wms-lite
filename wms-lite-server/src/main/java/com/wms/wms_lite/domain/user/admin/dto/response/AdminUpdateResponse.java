package com.wms.wms_lite.domain.user.admin.dto.response;

import com.wms.wms_lite.domain.user.admin.entity.Admin;
import java.time.LocalDateTime;

public record AdminUpdateResponse(Long id, String name, String phone, String email, LocalDateTime updatedAt) { public static AdminUpdateResponse from(Admin admin){ return new AdminUpdateResponse(admin.getId(), admin.getName(), admin.getPhone(), admin.getEmail(), admin.getUpdatedAt()); } }
