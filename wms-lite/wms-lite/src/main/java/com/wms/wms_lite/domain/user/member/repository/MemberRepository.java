package com.wms.wms_lite.domain.user.member.repository;

import com.wms.wms_lite.domain.user.member.entity.Member;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
    boolean existsByLoginId(String loginId);
    boolean existsByEmail(String email);
    Optional<Member> findByLoginId(String loginId);
}
