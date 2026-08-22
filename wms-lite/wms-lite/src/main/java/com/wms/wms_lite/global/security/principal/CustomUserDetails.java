package com.wms.wms_lite.global.security.principal;

import java.util.Collection;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
@Builder
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String loginId;
    private final String password;
    private final String name;
    @Builder.Default
    private final List<String> roles = List.of();
    @Builder.Default
    private final boolean enabled = true;
    @Builder.Default
    private final boolean accountNonLocked = true;
    @Builder.Default
    private final boolean accountNonExpired = true;
    @Builder.Default
    private final boolean credentialsNonExpired = true;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(SimpleGrantedAuthority::new)
                .toList();
    }

    @Override
    public String getUsername() {
        return loginId;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
