package com.wms.wms_lite.domain.user.admin.service;

import com.wms.wms_lite.domain.user.admin.dto.request.AdminLoginRequest;
import com.wms.wms_lite.domain.user.admin.dto.response.AdminLoginResponse;
import com.wms.wms_lite.domain.user.admin.entity.Admin;
import com.wms.wms_lite.domain.user.admin.exception.AdminErrorCode;
import com.wms.wms_lite.domain.user.admin.exception.AdminException;
import com.wms.wms_lite.domain.user.admin.repository.AdminRepository;
import com.wms.wms_lite.domain.user.enums.AccountStatus;
import com.wms.wms_lite.global.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminLoginService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TransactionTemplate transactionTemplate;

    @Transactional
    public AdminLoginResponse login(AdminLoginRequest request) {
        Admin admin = adminRepository.findByLoginId(request.loginId())
                .orElseThrow(() -> new AdminException(AdminErrorCode.ADMIN_NOT_FOUND));

        if (admin.getStatus() == AccountStatus.DELETED) {
            throw new AdminException(AdminErrorCode.ADMIN_NOT_FOUND);
        }

        if (admin.getStatus() == AccountStatus.LOCKED) {
            throw new AdminException(AdminErrorCode.ADMIN_ACCOUNT_LOCKED);
        }

        if (admin.getStatus() == AccountStatus.INACTIVE) {
            throw new AdminException(AdminErrorCode.ADMIN_ACCOUNT_INACTIVE);
        }

        if (!passwordEncoder.matches(request.password(), admin.getPassword())) {
            transactionTemplate.executeWithoutResult(status -> {
                Admin currentAdmin = adminRepository.findById(admin.getId()).orElse(admin);
                currentAdmin.setLoginFailCount(currentAdmin.getLoginFailCount() + 1);
                if (currentAdmin.getLoginFailCount() >= 5) {
                    currentAdmin.setStatus(AccountStatus.LOCKED);
                }
                adminRepository.save(currentAdmin);
            });
            throw new AdminException(AdminErrorCode.ADMIN_PASSWORD_INVALID);
        }

        admin.setLoginFailCount(0);
        admin.setLastLoginAt(LocalDateTime.now());

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                admin.getLoginId(), null, List.of(new SimpleGrantedAuthority(admin.getRole().name())));

        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication);
        admin.setRefreshToken(hashToken(refreshToken)); // DB에는 SHA-256 해시값만 저장

        adminRepository.save(admin);

        return new AdminLoginResponse(
                admin.getId(),
                admin.getLoginId(),
                admin.getName(),
                admin.getRole(),
                accessToken,
                refreshToken);
    }

    @Transactional
    public void logout(String loginId) {
        Admin admin = adminRepository.findByLoginId(loginId)
                .orElseThrow(() -> new AdminException(AdminErrorCode.ADMIN_NOT_FOUND));
        admin.setRefreshToken(null);
        adminRepository.save(admin);
    }

    @Transactional
    public AdminLoginResponse reissueAccessToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new AdminException(AdminErrorCode.ADMIN_PERMISSION_DENIED);
        }

        Authentication authentication = jwtTokenProvider.getAuthentication(refreshToken);
        Admin admin = adminRepository.findByLoginId(authentication.getName())
                .orElseThrow(() -> new AdminException(AdminErrorCode.ADMIN_NOT_FOUND));

        if (admin.getStatus() != AccountStatus.ACTIVE) {
            throw new AdminException(AdminErrorCode.ADMIN_ACCOUNT_INACTIVE);
        }

        // RTR 재사용 탐지 (Token Reuse Detection):
        // 유효한 서명의 토큰이나 DB의 현재 해시값과 일치하지 않는 경우 -> 탈취/구형 토큰 재사용 의심
        if (!hashToken(refreshToken).equals(admin.getRefreshToken())) {
            // 즉시 계정의 Refresh Token을 폐기하여 탈취 피해 확산 방지 (강제 로그아웃)
            admin.setRefreshToken(null);
            adminRepository.save(admin);
            log.warn("🚨 [보안 경고] Admin ID '{}' 에 대해 폐기된 Refresh Token 재사용 시도 감지! 모든 활성 세션을 강제 무효화합니다.",
                    admin.getLoginId());
            throw new AdminException(AdminErrorCode.ADMIN_PERMISSION_DENIED);
        }

        Authentication auth = new UsernamePasswordAuthenticationToken(
                admin.getLoginId(), null, List.of(new SimpleGrantedAuthority(admin.getRole().name())));

        String newAccessToken = jwtTokenProvider.createAccessToken(auth);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(auth);
        admin.setRefreshToken(hashToken(newRefreshToken)); // DB에는 SHA-256 해시값만 저장

        adminRepository.save(admin);

        return new AdminLoginResponse(
                admin.getId(),
                admin.getLoginId(),
                admin.getName(),
                admin.getRole(),
                newAccessToken,
                newRefreshToken);
    }

    /**
     * Refresh Token을 SHA-256으로 해시화합니다.
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
