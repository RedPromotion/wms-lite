package com.wms.wms_lite.domain.user.member.entity;

import com.wms.wms_lite.domain.user.entity.UserEntity;
import com.wms.wms_lite.domain.user.member.enums.Department;
import com.wms.wms_lite.domain.user.member.enums.MemberRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "members")
public class Member extends UserEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Department department = Department.VIEWER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private MemberRole role = MemberRole.ROLE_VIEWER;
}
