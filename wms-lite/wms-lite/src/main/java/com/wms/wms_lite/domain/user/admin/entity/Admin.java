package com.wms.wms_lite.domain.user.admin.entity;

import com.wms.wms_lite.domain.user.admin.enums.AdminRole;
import com.wms.wms_lite.domain.user.entity.UserEntity;
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
@Table(name = "admins")
public class Admin extends UserEntity {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AdminRole role = AdminRole.ROLE_ADMIN_OPS;
}
