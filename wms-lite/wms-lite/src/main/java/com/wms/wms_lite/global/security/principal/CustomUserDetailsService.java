package com.wms.wms_lite.global.security.principal;

import com.wms.wms_lite.domain.user.admin.entity.Admin;
import com.wms.wms_lite.domain.user.admin.repository.AdminRepository;
import com.wms.wms_lite.domain.user.enums.AccountStatus;
import com.wms.wms_lite.domain.user.member.entity.Member;
import com.wms.wms_lite.domain.user.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Admin admin = adminRepository.findByLoginId(username).orElse(null);
        if (admin != null) {
            return CustomUserDetails.builder()
                    .id(admin.getId())
                    .loginId(admin.getLoginId())
                    .password(admin.getPassword())
                    .name(admin.getName())
                    .roles(List.of(admin.getRole().name()))
                    .enabled(admin.getStatus() == AccountStatus.ACTIVE)
                    .accountNonLocked(admin.getStatus() != AccountStatus.LOCKED)
                    .credentialsNonExpired(!admin.getPasswordExpired())
                    .build();
        }

        Member member = memberRepository.findByLoginId(username).orElse(null);
        if (member != null) {
            return CustomUserDetails.builder()
                    .id(member.getId())
                    .loginId(member.getLoginId())
                    .password(member.getPassword())
                    .name(member.getName())
                    .roles(List.of(member.getRole().name()))
                    .enabled(member.getStatus() == AccountStatus.ACTIVE)
                    .accountNonLocked(member.getStatus() != AccountStatus.LOCKED)
                    .credentialsNonExpired(!member.getPasswordExpired())
                    .build();
        }

        throw new UsernameNotFoundException("User lookup failed for login ID: " + username);
    }
}
