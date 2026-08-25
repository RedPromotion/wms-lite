package com.wms.wms_lite.global.audit;

import com.wms.wms_lite.global.util.SecurityUtils;
import java.util.Optional;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

@Component
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        return Optional.of(SecurityUtils.getCurrentUsername().orElse("system"));
    }
}
