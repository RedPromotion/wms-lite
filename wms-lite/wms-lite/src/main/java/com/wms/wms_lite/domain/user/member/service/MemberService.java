package com.wms.wms_lite.domain.user.member.service;

import com.wms.wms_lite.domain.user.member.dto.request.*;
import com.wms.wms_lite.domain.user.member.dto.response.*;
import com.wms.wms_lite.domain.user.member.entity.Member;
import com.wms.wms_lite.domain.user.member.enums.Department;
import com.wms.wms_lite.domain.user.member.enums.MemberRole;
import com.wms.wms_lite.domain.user.member.exception.*;
import com.wms.wms_lite.domain.user.member.repository.MemberRepository;
import com.wms.wms_lite.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wms.wms_lite.global.util.SecurityUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MemberCreateResponse createMember(MemberCreateRequest request) {
        if (memberRepository.existsByLoginId(request.loginId())) {
            throw new MemberException(MemberErrorCode.MEMBER_LOGIN_ID_DUPLICATED);
        }
        if (memberRepository.existsByEmail(request.email())) {
            throw new MemberException(MemberErrorCode.MEMBER_EMAIL_DUPLICATED);
        }

        Member member = new Member();
        member.setLoginId(request.loginId());
        member.setPassword(passwordEncoder.encode(request.password()));
        member.setName(request.name());
        member.setPhone(request.phone());
        member.setEmail(request.email());
        member.setDepartment(request.department() == null ? Department.VIEWER : request.department());
        member.setRole(request.role() == null ? MemberRole.ROLE_VIEWER : request.role());

        return MemberCreateResponse.from(memberRepository.save(member));
    }

    public MemberResponse getMember(Long id) {
        return MemberResponse.from(findMember(id));
    }

    public PageResponse<MemberSummaryResponse> getMemberList(Pageable pageable) {
        return PageResponse.from(memberRepository.findAll(pageable).map(MemberSummaryResponse::from));
    }

    @Transactional
    public MemberUpdateResponse updateMember(Long id, MemberUpdateRequest request) {
        Member member = findMember(id);

        if (request.email() != null && !request.email().equals(member.getEmail()) && memberRepository.existsByEmail(request.email())) {
            throw new MemberException(MemberErrorCode.MEMBER_EMAIL_DUPLICATED);
        }
        if (request.name() != null) {
            member.setName(request.name());
        }
        if (request.phone() != null) {
            member.setPhone(request.phone());
        }
        if (request.email() != null) {
            member.setEmail(request.email());
        }
        if (request.department() != null) {
            member.setDepartment(request.department());
        }

        return MemberUpdateResponse.from(member);
    }

    @Transactional
    public void deleteMember(Long id) {
        findMember(id).markDeleted(SecurityUtils.getCurrentUsername().orElseThrow(() -> new IllegalStateException("Authenticated user not found")));
    }

    @Transactional
    public MemberResponse changeRole(Long id, MemberRoleChangeRequest request) {
        Member member = findMember(id);
        member.setRole(request.role());
        return MemberResponse.from(member);
    }

    @Transactional
    public MemberResponse changeDepartment(Long id, MemberDepartmentChangeRequest request) {
        Member member = findMember(id);
        member.setDepartment(request.department());
        return MemberResponse.from(member);
    }

    @Transactional
    public MemberResponse changeStatus(Long id, MemberStatusChangeRequest request) {
        Member member = findMember(id);
        member.setStatus(request.status());
        return MemberResponse.from(member);
    }

    @Transactional
    public void changePassword(Long id, MemberPasswordChangeRequest request) {
        Member member = findMember(id);
        if (!passwordEncoder.matches(request.currentPassword(), member.getPassword())) {
            throw new MemberException(MemberErrorCode.MEMBER_PASSWORD_INVALID);
        }
        member.setPassword(passwordEncoder.encode(request.newPassword()));
        member.setPasswordExpired(false);
    }

    public Member findMember(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_NOT_FOUND));
    }
}
