package com.wms.wms_lite.domain.user.admin.repository;

import com.wms.wms_lite.domain.user.admin.entity.Admin;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    boolean existsByLoginId(String loginId);

    boolean existsByEmail(String email);

    Optional<Admin> findByLoginId(String loginId);
}
