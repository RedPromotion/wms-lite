package com.wms.wms_lite.domain.user.member.dto.response;

import com.wms.wms_lite.domain.user.member.entity.Member;
import java.time.LocalDateTime;

public record MemberUpdateResponse(Long id, String name, String phone, String email, LocalDateTime updatedAt) { public static MemberUpdateResponse from(Member member){ return new MemberUpdateResponse(member.getId(), member.getName(), member.getPhone(), member.getEmail(), member.getUpdatedAt()); } }
