package com.wms.wms_lite.domain.user.admin.controller;

import com.wms.wms_lite.domain.user.member.dto.request.*;
import com.wms.wms_lite.domain.user.member.dto.response.*;
import com.wms.wms_lite.domain.user.member.service.MemberService;
import com.wms.wms_lite.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/members")
public class AdminMemberController {
    private final MemberService memberService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV')")
    public MemberCreateResponse createMember(@Valid @RequestBody MemberCreateRequest request){
        return memberService.createMember(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public MemberResponse getMember(@PathVariable Long id){
        return memberService.getMember(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV', 'ADMIN_OPS')")
    public PageResponse<MemberSummaryResponse> getMemberList(Pageable pageable){
        return memberService.getMemberList(pageable);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV')")
    public MemberUpdateResponse updateMember(@PathVariable Long id, @Valid @RequestBody MemberUpdateRequest request){
        return memberService.updateMember(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV')")
    public void deleteMember(@PathVariable Long id){
        memberService.deleteMember(id);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER')")
    public MemberResponse changeRole(@PathVariable Long id, @Valid @RequestBody MemberRoleChangeRequest request){
        return memberService.changeRole(id, request);
    }

    @PutMapping("/{id}/department")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV')")
    public MemberResponse changeDepartment(@PathVariable Long id, @Valid @RequestBody MemberDepartmentChangeRequest request){
        return memberService.changeDepartment(id, request);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN_SUPER', 'ADMIN_DEV')")
    public MemberResponse changeStatus(@PathVariable Long id, @Valid @RequestBody MemberStatusChangeRequest request){
        return memberService.changeStatus(id, request);
    }
}

