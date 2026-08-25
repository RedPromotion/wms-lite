package com.wms.wms_lite.domain.user.entity;

import com.wms.wms_lite.domain.user.enums.AccountStatus;
import com.wms.wms_lite.global.entity.SoftDeleteEntity;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@MappedSuperclass
public abstract class UserEntity extends SoftDeleteEntity {
    @Column(nullable = false, unique = true, length = 50)
    private String loginId;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(length = 30)
    private String phone;
    @Column(nullable = false, unique = true, length = 150)
    private String email;
    private LocalDateTime lastLoginAt;
    private Integer loginFailCount = 0;
    private Boolean passwordExpired = false;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AccountStatus status = AccountStatus.ACTIVE;
    @Column(length = 500)
    private String refreshToken;
}
