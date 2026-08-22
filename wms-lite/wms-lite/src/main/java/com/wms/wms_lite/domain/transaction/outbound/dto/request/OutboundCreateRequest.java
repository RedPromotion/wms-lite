package com.wms.wms_lite.domain.transaction.outbound.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record OutboundCreateRequest(
                @NotNull(message = "고객 ID는 필수입니다.") Long customerId,

                @NotNull(message = "배송지 ID는 필수입니다.") Long deliveryAddressId,

                @NotEmpty(message = "출고 품목 목록은 비어 있을 수 없습니다.") @Valid List<OutboundItemRequest> items,

                String description) {
}
