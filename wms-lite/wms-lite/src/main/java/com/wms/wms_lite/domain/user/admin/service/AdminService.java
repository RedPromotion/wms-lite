package com.wms.wms_lite.domain.user.admin.service;

import com.wms.wms_lite.domain.user.admin.dto.request.*;
import com.wms.wms_lite.domain.user.admin.dto.response.*;
import com.wms.wms_lite.domain.user.admin.entity.Admin;
import com.wms.wms_lite.domain.user.admin.exception.*;
import com.wms.wms_lite.domain.user.admin.repository.AdminRepository;
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
public class AdminService {
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AdminCreateResponse createAdmin(AdminCreateRequest request) {
        if (adminRepository.existsByLoginId(request.loginId())) {
            throw new AdminException(AdminErrorCode.ADMIN_LOGIN_ID_DUPLICATED);
        }
        if (adminRepository.existsByEmail(request.email())) {
            throw new AdminException(AdminErrorCode.ADMIN_EMAIL_DUPLICATED);
        }
        
        Admin admin = new Admin();
        admin.setLoginId(request.loginId());
        admin.setPassword(passwordEncoder.encode(request.password()));
        admin.setName(request.name());
        admin.setPhone(request.phone());
        admin.setEmail(request.email());
        
        return AdminCreateResponse.from(adminRepository.save(admin));
    }

    public AdminResponse getAdmin(Long id) {
        return AdminResponse.from(findAdmin(id));
    }

    public PageResponse<AdminSummaryResponse> getAdminList(Pageable pageable) {
        return PageResponse.from(adminRepository.findAll(pageable).map(AdminSummaryResponse::from));
    }

    @Transactional
    public AdminUpdateResponse updateAdmin(Long id, AdminUpdateRequest request) {
        Admin admin = findAdmin(id);
        
        if (request.email() != null && !request.email().equals(admin.getEmail()) && adminRepository.existsByEmail(request.email())) {
            throw new AdminException(AdminErrorCode.ADMIN_EMAIL_DUPLICATED);
        }
        if (request.name() != null) {
            admin.setName(request.name());
        }
        if (request.phone() != null) {
            admin.setPhone(request.phone());
        }
        if (request.email() != null) {
            admin.setEmail(request.email());
        }
        
        return AdminUpdateResponse.from(admin);
    }

    @Transactional
    public void deleteAdmin(Long id) {
        findAdmin(id).markDeleted(SecurityUtils.getCurrentUsername().orElseThrow(() -> new IllegalStateException("Authenticated user not found")));
    }

    @Transactional
    public AdminResponse changeRole(Long id, AdminRoleChangeRequest request) {
        Admin admin = findAdmin(id);
        admin.setRole(request.role());
        return AdminResponse.from(admin);
    }

    @Transactional
    public AdminResponse changeStatus(Long id, AdminStatusChangeRequest request) {
        Admin admin = findAdmin(id);
        admin.setStatus(request.status());
        return AdminResponse.from(admin);
    }

    @Transactional
    public void changePassword(Long id, AdminPasswordChangeRequest request) {
        Admin admin = findAdmin(id);
        if (!passwordEncoder.matches(request.currentPassword(), admin.getPassword())) {
            throw new AdminException(AdminErrorCode.ADMIN_PASSWORD_INVALID);
        }
        admin.setPassword(passwordEncoder.encode(request.newPassword()));
        admin.setPasswordExpired(false);
    }

    public Admin findAdmin(Long id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new AdminException(AdminErrorCode.ADMIN_NOT_FOUND));
    }
}

