package com.wms.wms_lite.domain.transaction.outbound.repository;

import com.wms.wms_lite.domain.transaction.outbound.entity.OutboundItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OutboundItemRepository extends JpaRepository<OutboundItem, Long> {
    List<OutboundItem> findByOutboundId(Long outboundId);
    List<OutboundItem> findByItemId(Long itemId);
}
