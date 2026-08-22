package com.wms.wms_lite.domain.user.member.repository;

import com.wms.wms_lite.domain.user.member.entity.LoginHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    Page<LoginHistory> findByLoginIdOrderByIdDesc(String loginId, Pageable pageable);

}
