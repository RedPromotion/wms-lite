package com.wms.wms_lite.domain.transaction.inbound.repository;

import com.wms.wms_lite.domain.transaction.inbound.entity.InboundItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InboundItemRepository extends JpaRepository<InboundItem, Long> {
    List<InboundItem> findByInboundId(Long inboundId);
    List<InboundItem> findByItemId(Long itemId);
}
