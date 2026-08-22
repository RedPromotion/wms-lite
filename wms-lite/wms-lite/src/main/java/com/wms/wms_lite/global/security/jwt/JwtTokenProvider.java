package com.wms.wms_lite.global.security.jwt;

import com.wms.wms_lite.global.constant.SecurityConstants;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenValiditySeconds;
    private final long refreshTokenValiditySeconds;

    public JwtTokenProvider(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-token-validity-seconds}") long accessTokenValiditySeconds,
            @Value("${security.jwt.refresh-token-validity-seconds}") long refreshTokenValiditySeconds) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValiditySeconds = accessTokenValiditySeconds;
        this.refreshTokenValiditySeconds = refreshTokenValiditySeconds;
    }

    public long getAccessTokenValiditySeconds() {
        return accessTokenValiditySeconds;
    }

    public String createAccessToken(Authentication authentication) {
        String authorities = toAuthorityClaim(authentication.getAuthorities());
        return createToken(authentication.getName(), authorities, accessTokenValiditySeconds);
    }

    public String createRefreshToken(Authentication authentication) {
        return createToken(authentication.getName(), "", refreshTokenValiditySeconds);
    }

    public JwtAuthenticationToken getAuthentication(String token) {
        Claims claims = parseClaims(token);
        String username = claims.getSubject();
        String authorityClaim = claims.get(SecurityConstants.AUTHORITY_CLAIM, String.class);
        List<SimpleGrantedAuthority> authorities = toAuthorities(authorityClaim);
        return new JwtAuthenticationToken(username, token, authorities);
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private String createToken(String subject, String authorities, long validitySeconds) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(validitySeconds);

        return Jwts.builder()
                .subject(subject)
                .claim(SecurityConstants.AUTHORITY_CLAIM, authorities)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String toAuthorityClaim(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream()
                .map(authority -> authority.getAuthority())
                .reduce((left, right) -> left + "," + right)
                .orElse("");
    }

    private List<SimpleGrantedAuthority> toAuthorities(String authorityClaim) {
        if (authorityClaim == null || authorityClaim.isBlank()) {
            return List.of();
        }
        return Arrays.stream(authorityClaim.split(","))
                .filter(value -> !value.isBlank())
                .map(SimpleGrantedAuthority::new)
                .toList();
    }
}
