package com.wms.wms_lite.domain.user.member.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "login_histories")
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", nullable = false, length = 50)
    private String loginId;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // 'SUCCESS', 'FAILED', 'LOGOUT'

    @Column(name = "login_at", nullable = false)
    private LocalDateTime loginAt;

    @PrePersist
    public void prePersist() {
        if (this.loginAt == null) {
            this.loginAt = LocalDateTime.now();
        }
    }
}
