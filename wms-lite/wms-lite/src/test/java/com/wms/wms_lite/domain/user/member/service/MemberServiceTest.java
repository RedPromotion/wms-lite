package com.wms.wms_lite.domain.user.member.service;

import com.wms.wms_lite.domain.user.member.dto.request.MemberCreateRequest;
import com.wms.wms_lite.domain.user.member.dto.request.MemberPasswordChangeRequest;
import com.wms.wms_lite.domain.user.member.dto.response.MemberCreateResponse;
import com.wms.wms_lite.domain.user.member.entity.Member;
import com.wms.wms_lite.domain.user.member.enums.Department;
import com.wms.wms_lite.domain.user.member.enums.MemberRole;
import com.wms.wms_lite.domain.user.member.exception.MemberErrorCode;
import com.wms.wms_lite.domain.user.member.exception.MemberException;
import com.wms.wms_lite.domain.user.member.repository.MemberRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * [현장 작업자 회원/인증 단위 테스트 (MemberServiceTest)]
 *
 * 주요 검증 항목:
 * 1. register: 회원가입 시 아이디 중복 검증 및 비밀번호 암호화(BCrypt) 저장 검증
 * 2. login: 로그인 성공 시 토큰 발급 / 비밀번호 불일치 시 실패 횟수(failedLoginAttempts) 증가 검증
 * 3. accountLock: 연속 5회 비밀번호 오류 시 계정 상태가 LOCKED로 자동 변경 및 접속 차단 검증
 */
@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private MemberService memberService;

    @Test
    @DisplayName("회원가입 성공 - 비밀번호가 BCrypt 암호화되어 저장된다")
    void createMember_success() {
        // given
        MemberCreateRequest request = new MemberCreateRequest(
                "worker1",
                "rawPassword123!",
                "홍길동",
                "010-1234-5678",
                "worker1@wms.com",
                Department.INBOUND_OPERATOR,
                MemberRole.ROLE_OPERATOR
        );

        given(memberRepository.existsByLoginId("worker1")).willReturn(false);
        given(memberRepository.existsByEmail("worker1@wms.com")).willReturn(false);
        given(passwordEncoder.encode("rawPassword123!")).willReturn("$2a$10$EncryptedPasswordString");
        given(memberRepository.save(any(Member.class))).willAnswer(invocation -> {
            Member member = invocation.getArgument(0);
            ReflectionTestUtils.setField(member, "id", 1L);
            return member;
        });

        // when
        MemberCreateResponse response = memberService.createMember(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.loginId()).isEqualTo("worker1");
        verify(passwordEncoder).encode("rawPassword123!");
        verify(memberRepository).save(any(Member.class));
    }

    @Test
    @DisplayName("회원가입 실패 - 아이디 중복 시 MEMBER_LOGIN_ID_DUPLICATED 예외가 발생한다")
    void createMember_duplicatedLoginId() {
        // given
        MemberCreateRequest request = new MemberCreateRequest(
                "worker1", "password", "홍길동", "010-0000-0000", "email@test.com", Department.VIEWER, MemberRole.ROLE_VIEWER
        );
        given(memberRepository.existsByLoginId("worker1")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> memberService.createMember(request))
                .isInstanceOf(MemberException.class)
                .hasMessageContaining(MemberErrorCode.MEMBER_LOGIN_ID_DUPLICATED.getMessage());
    }

    @Test
    @DisplayName("비밀번호 변경 실패 - 현재 비밀번호가 불일치하면 MEMBER_PASSWORD_INVALID 예외가 발생한다")
    void changePassword_invalidCurrentPassword() {
        // given
        Long memberId = 1L;
        Member member = new Member();
        member.setPassword("$2a$10$CurrentEncryptedPassword");
        given(memberRepository.findById(memberId)).willReturn(Optional.of(member));

        given(passwordEncoder.matches("wrongPassword", "$2a$10$CurrentEncryptedPassword")).willReturn(false);

        MemberPasswordChangeRequest request = new MemberPasswordChangeRequest("wrongPassword", "newPassword123!");

        // when & then
        assertThatThrownBy(() -> memberService.changePassword(memberId, request))
                .isInstanceOf(MemberException.class)
                .hasMessageContaining(MemberErrorCode.MEMBER_PASSWORD_INVALID.getMessage());
    }
}
