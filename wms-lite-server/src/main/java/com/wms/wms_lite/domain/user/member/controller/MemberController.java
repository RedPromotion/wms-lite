package com.wms.wms_lite.domain.user.member.controller;

import com.wms.wms_lite.domain.user.member.dto.request.*;
import com.wms.wms_lite.domain.user.member.dto.response.*;
import com.wms.wms_lite.domain.user.member.entity.Member;
import com.wms.wms_lite.domain.user.member.service.MemberLoginService;
import com.wms.wms_lite.domain.user.member.service.MemberService;
import com.wms.wms_lite.global.response.PageResponse;
import com.wms.wms_lite.global.util.SecurityUtils;
import com.wms.wms_lite.domain.user.member.exception.MemberErrorCode;
import com.wms.wms_lite.domain.user.member.exception.MemberException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;
    private final MemberLoginService memberLoginService;

    @PostMapping("/login")
    public MemberLoginResponse login(@Valid @RequestBody MemberLoginRequest request) {
        return memberLoginService.login(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout() {
        String loginId = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_NOT_FOUND));
        memberLoginService.logout(loginId);
    }

    @PostMapping("/reissue")
    public MemberLoginResponse reissue(@Valid @RequestBody ReissueRequest request) {
        return memberLoginService.reissueAccessToken(request.refreshToken());
    }

    @GetMapping("/me/login-history")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<LoginHistoryResponse> getMyLoginHistory(Pageable pageable) {
        String currentUsername = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_PERMISSION_DENIED));
        return memberLoginService.getLoginHistoryList(currentUsername, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public MemberCreateResponse createMember(@Valid @RequestBody MemberCreateRequest request) {
        return memberService.createMember(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public MemberResponse getMember(@PathVariable Long id) {
        return memberService.getMember(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public PageResponse<MemberSummaryResponse> getMemberList(Pageable pageable) {
        return memberService.getMemberList(pageable);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER', 'ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public MemberUpdateResponse updateMember(@PathVariable Long id, @Valid @RequestBody MemberUpdateRequest request) {
        validateSelfOrManagement(id);
        return memberService.updateMember(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public void deleteMember(@PathVariable Long id) {
        validateSelfOrManagement(id);
        memberService.deleteMember(id);
    }

    @PutMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('MANAGER', 'OPERATOR', 'VIEWER')")
    public void changePassword(@PathVariable Long id, @Valid @RequestBody MemberPasswordChangeRequest request) {
        validateSelfOnly(id);
        memberService.changePassword(id, request);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV')")
    public MemberResponse changeRole(@PathVariable Long id, @Valid @RequestBody MemberRoleChangeRequest request) {
        return memberService.changeRole(id, request);
    }

    @PutMapping("/{id}/department")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN_SUPER', 'ADMIN_DEV')")
    public MemberResponse changeDepartment(@PathVariable Long id,
            @Valid @RequestBody MemberDepartmentChangeRequest request) {
        return memberService.changeDepartment(id, request);
    }

    /**
     * 본인 혹은 매니저/어드민 권한이 있는지 체크
     */
    private void validateSelfOrManagement(Long id) {
        String currentUsername = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_PERMISSION_DENIED));

        Member targetMember = memberService.findMember(id);

        boolean isSelf = currentUsername.equals(targetMember.getLoginId());
        boolean hasManagementRole = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER")
                        || a.getAuthority().equals("ROLE_ADMIN_SUPER")
                        || a.getAuthority().equals("ROLE_ADMIN_DEV"));

        if (!isSelf && !hasManagementRole) {
            throw new MemberException(MemberErrorCode.MEMBER_PERMISSION_DENIED);
        }
    }

    /**
     * 오직 본인(요청 당사자)인지 체크
     */
    private void validateSelfOnly(Long id) {
        String currentUsername = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_PERMISSION_DENIED));

        Member targetMember = memberService.findMember(id);

        if (!currentUsername.equals(targetMember.getLoginId())) {
            throw new MemberException(MemberErrorCode.MEMBER_PERMISSION_DENIED);
        }
    }
}
