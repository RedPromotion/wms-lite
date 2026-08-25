package com.wms.wms_lite.domain.user.member.service;

import com.wms.wms_lite.domain.user.member.dto.request.MemberLoginRequest;
import com.wms.wms_lite.domain.user.member.dto.response.LoginHistoryResponse;
import com.wms.wms_lite.domain.user.member.dto.response.MemberLoginResponse;
import com.wms.wms_lite.domain.user.member.entity.LoginHistory;
import com.wms.wms_lite.domain.user.member.entity.Member;
import com.wms.wms_lite.domain.user.member.enums.Department;
import com.wms.wms_lite.domain.user.member.enums.MemberRole;
import com.wms.wms_lite.domain.user.member.exception.MemberErrorCode;
import com.wms.wms_lite.domain.user.member.exception.MemberException;
import com.wms.wms_lite.domain.user.member.repository.LoginHistoryRepository;
import com.wms.wms_lite.domain.user.member.repository.MemberRepository;
import com.wms.wms_lite.domain.user.enums.AccountStatus;
import com.wms.wms_lite.global.response.PageResponse;
import com.wms.wms_lite.global.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberLoginService {

    private final MemberRepository memberRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TransactionTemplate transactionTemplate;

    @Value("${app.demo-login.enabled:true}")
    private boolean demoLoginEnabled;

    @Transactional
    public MemberLoginResponse login(MemberLoginRequest request) {
        HttpServletRequest httpRequest = getCurrentHttpRequest();
        String clientIp = getClientIp(httpRequest);
        String userAgent = getUserAgent(httpRequest);

        Member member = memberRepository.findByLoginId(request.loginId())
                .or(() -> provisionDemoMemberIfMatched(request))
                .orElseThrow(() -> {
                    recordLoginHistory(request.loginId(), clientIp, userAgent, "FAILED");
                    return new MemberException(MemberErrorCode.MEMBER_NOT_FOUND);
                });

        if (member.getStatus() == AccountStatus.DELETED) {
            recordLoginHistory(request.loginId(), clientIp, userAgent, "FAILED");
            throw new MemberException(MemberErrorCode.MEMBER_NOT_FOUND);
        }

        if (member.getStatus() == AccountStatus.LOCKED) {
            recordLoginHistory(request.loginId(), clientIp, userAgent, "FAILED");
            throw new MemberException(MemberErrorCode.MEMBER_ACCOUNT_LOCKED);
        }

        if (member.getStatus() == AccountStatus.INACTIVE) {
            recordLoginHistory(request.loginId(), clientIp, userAgent, "FAILED");
            throw new MemberException(MemberErrorCode.MEMBER_ACCOUNT_INACTIVE);
        }

        if (!passwordEncoder.matches(request.password(), member.getPassword())) {
            transactionTemplate.executeWithoutResult(status -> {
                Member currentMember = memberRepository.findById(member.getId()).orElse(member);
                currentMember.setLoginFailCount(currentMember.getLoginFailCount() + 1);
                if (currentMember.getLoginFailCount() >= 5) {
                    currentMember.setStatus(AccountStatus.LOCKED);
                }
                memberRepository.save(currentMember);
                recordLoginHistory(request.loginId(), clientIp, userAgent, "FAILED");
            });
            throw new MemberException(MemberErrorCode.MEMBER_PASSWORD_INVALID);
        }

        member.setLoginFailCount(0);
        member.setLastLoginAt(LocalDateTime.now());

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                member.getLoginId(), null, List.of(new SimpleGrantedAuthority(member.getRole().name())));

        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication);
        member.setRefreshToken(hashToken(refreshToken)); // DB에는 SHA-256 해시값만 저장

        memberRepository.save(member);

        // 로그인 성공 이력 기록
        recordLoginHistory(member.getLoginId(), clientIp, userAgent, "SUCCESS");

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(jwtTokenProvider.getAccessTokenValiditySeconds());

        return new MemberLoginResponse(
                member.getId(),
                member.getLoginId(),
                member.getName(),
                member.getDepartment(),
                member.getRole(),
                accessToken,
                refreshToken,
                expiresAt);
    }

    private Optional<Member> provisionDemoMemberIfMatched(MemberLoginRequest request) {
        if (!demoLoginEnabled) {
            return Optional.empty();
        }
        if (!"sample_supervisor".equals(request.loginId()) || !"SamplePassword123!".equals(request.password())) {
            return Optional.empty();
        }

        Member member = new Member();
        member.setLoginId("sample_supervisor");
        member.setPassword(passwordEncoder.encode("SamplePassword123!"));
        member.setName("현장 총괄(예시)");
        member.setEmail("supervisor@example.com");
        member.setPhone("010-0000-0002");
        member.setDepartment(Department.WAREHOUSE_OPERATOR);
        member.setRole(MemberRole.ROLE_MANAGER);
        member.setStatus(AccountStatus.ACTIVE);

        Member saved = memberRepository.save(member);
        log.info("▶ 공개 데모 계정 자동 생성: {}", saved.getLoginId());
        return Optional.of(saved);
    }

    @Transactional
    public void logout(String loginId) {
        HttpServletRequest httpRequest = getCurrentHttpRequest();
        String clientIp = getClientIp(httpRequest);
        String userAgent = getUserAgent(httpRequest);

        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_NOT_FOUND));
        member.setRefreshToken(null);
        memberRepository.save(member);

        recordLoginHistory(loginId, clientIp, userAgent, "LOGOUT");
    }

    public PageResponse<LoginHistoryResponse> getLoginHistoryList(String loginId, Pageable pageable) {
        Page<LoginHistory> page = loginHistoryRepository.findByLoginIdOrderByIdDesc(loginId, pageable);
        return PageResponse.from(page.map(LoginHistoryResponse::from));
    }

    private void recordLoginHistory(String loginId, String ipAddress, String userAgent, String status) {
        try {
            transactionTemplate.executeWithoutResult(txStatus -> {
                LoginHistory history = new LoginHistory();
                history.setLoginId(loginId);
                history.setIpAddress(ipAddress != null ? ipAddress : "127.0.0.1");
                history.setUserAgent(
                        userAgent != null && userAgent.length() > 250 ? userAgent.substring(0, 250) : userAgent);
                history.setStatus(status);
                history.setLoginAt(LocalDateTime.now());
                loginHistoryRepository.save(history);
            });
        } catch (Exception ignored) {
            // 이력 저장 실패가 메인 로그인 트랜잭션을 방해하지 않도록 처리
        }
    }

    private HttpServletRequest getCurrentHttpRequest() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attrs != null ? attrs.getRequest() : null;
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null)
            return "127.0.0.1";

        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    private String getUserAgent(HttpServletRequest request) {
        if (request == null)
            return "Unknown Browser";
        String ua = request.getHeader("User-Agent");
        return ua != null ? ua : "Unknown Browser";
    }

    @Transactional
    public MemberLoginResponse reissueAccessToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new MemberException(MemberErrorCode.MEMBER_PERMISSION_DENIED);
        }

        Authentication authentication = jwtTokenProvider.getAuthentication(refreshToken);
        Member member = memberRepository.findByLoginId(authentication.getName())
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_NOT_FOUND));

        if (member.getStatus() != AccountStatus.ACTIVE) {
            throw new MemberException(MemberErrorCode.MEMBER_ACCOUNT_INACTIVE);
        }

        // RTR 재사용 탐지 (Token Reuse Detection):
        // 유효한 서명의 토큰이나 DB의 현재 해시값과 일치하지 않는 경우 -> 탈취/구형 토큰 재사용 의심
        if (!hashToken(refreshToken).equals(member.getRefreshToken())) {
            // 즉시 계정의 Refresh Token을 폐기하여 탈취 피해 확산 방지 (강제 로그아웃)
            member.setRefreshToken(null);
            memberRepository.save(member);
            log.warn("🚨 [보안 경고] Member ID '{}' 에 대해 폐기된 Refresh Token 재사용 시도 감지! 모든 활성 세션을 강제 무효화합니다.", member.getLoginId());
            throw new MemberException(MemberErrorCode.MEMBER_PERMISSION_DENIED);
        }

        Authentication auth = new UsernamePasswordAuthenticationToken(
                member.getLoginId(), null, List.of(new SimpleGrantedAuthority(member.getRole().name())));

        String newAccessToken = jwtTokenProvider.createAccessToken(auth);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(auth);
        member.setRefreshToken(hashToken(newRefreshToken)); // DB에는 SHA-256 해시값만 저장

        memberRepository.save(member);

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(jwtTokenProvider.getAccessTokenValiditySeconds());

        return new MemberLoginResponse(
                member.getId(),
                member.getLoginId(),
                member.getName(),
                member.getDepartment(),
                member.getRole(),
                newAccessToken,
                newRefreshToken,
                expiresAt);
    }

    /**
     * Refresh Token을 SHA-256으로 해시화합니다.
     *
     * 비밀번호와 달리 Refresh Token은 서버가 CSPRNG으로 생성한 고엔트로피 랜덤값이므로,
     * bcrypt 없이 SHA-256 단방향 해시만으로 충분한 보안을 제공합니다.
     *
     * @param token 원본 Refresh Token
     * @return SHA-256 해시값 (64자리 hex 문자열)
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes());
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256은 Java 표준 알고리즘으로 반드시 존재함 — 도달 불가
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
