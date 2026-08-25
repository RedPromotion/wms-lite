package com.wms.wms_lite.global.config;

import com.wms.wms_lite.domain.user.admin.entity.Admin;
import com.wms.wms_lite.domain.user.admin.repository.AdminRepository;
import com.wms.wms_lite.domain.user.member.entity.Member;
import com.wms.wms_lite.domain.user.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public")
public class TestSeedController {

    private final MemberRepository memberRepository;
    private final AdminRepository adminRepository;
    private final DataInitializer dataInitializer;

    @GetMapping("/seed-check")
    public Map<String, Object> checkSeed() {
        Map<String, Object> map = new HashMap<>();
        map.put("memberCount", memberRepository.count());
        map.put("adminCount", adminRepository.count());
        map.put("members", memberRepository.findAll().stream().map(Member::getLoginId).toList());
        map.put("admins", adminRepository.findAll().stream().map(Admin::getLoginId).toList());
        return map;
    }

    @PostMapping("/seed-run")
    public Map<String, Object> runSeed() {
        dataInitializer.run();
        return checkSeed();
    }
}
