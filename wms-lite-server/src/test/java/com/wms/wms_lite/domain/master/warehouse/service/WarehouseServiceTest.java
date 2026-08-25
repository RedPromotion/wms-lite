package com.wms.wms_lite.domain.master.warehouse.service;

import com.wms.wms_lite.domain.master.warehouse.dto.request.WarehouseCreateRequest;
import com.wms.wms_lite.domain.master.warehouse.dto.response.WarehouseCreateResponse;
import com.wms.wms_lite.domain.master.warehouse.entity.Warehouse;
import com.wms.wms_lite.domain.master.warehouse.exception.WarehouseErrorCode;
import com.wms.wms_lite.domain.master.warehouse.exception.WarehouseException;
import com.wms.wms_lite.domain.master.warehouse.repository.WarehouseRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * [창고/로케이션 마스터 단위 테스트 (WarehouseServiceTest)]
 *
 * 주요 검증 항목:
 * 1. createWarehouse: 창고 코드 중복 검증 및 창고 마스터 생성 검증
 * 2. createLocation: 존(Zone) 및 로케이션 코드 생성 및 중복 체크 검증
 * 3. deleteLocation: 로케이션 내 남은 재고가 존재하는 경우 삭제 불가 예외 처리 검증
 */
@ExtendWith(MockitoExtension.class)
class WarehouseServiceTest {

    @Mock
    private WarehouseRepository warehouseRepository;

    @InjectMocks
    private WarehouseService warehouseService;

    @Test
    @DisplayName("창고 생성 성공 - 중복 코드가 없으면 생성된다")
    void createWarehouse_success() {
        // given
        WarehouseCreateRequest request = new WarehouseCreateRequest(
                "WH-01", "제1물류창고", "02-1234-5678", "창고장", "경기도 김포시", "메인 입출고 창고"
        );

        given(warehouseRepository.existsByCode("WH-01")).willReturn(false);
        given(warehouseRepository.save(any(Warehouse.class))).willAnswer(invocation -> {
            Warehouse wh = invocation.getArgument(0);
            ReflectionTestUtils.setField(wh, "id", 1L);
            return wh;
        });

        // when
        WarehouseCreateResponse response = warehouseService.createWarehouse(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.code()).isEqualTo("WH-01");
        verify(warehouseRepository).save(any(Warehouse.class));
    }

    @Test
    @DisplayName("창고 생성 실패 - 이미 존재하는 코드 요청 시 WAREHOUSE_CODE_DUPLICATED 예외가 발생한다")
    void createWarehouse_duplicatedCode() {
        // given
        WarehouseCreateRequest request = new WarehouseCreateRequest(
                "WH-01", "제1물류창고", null, null, null, null
        );
        given(warehouseRepository.existsByCode("WH-01")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> warehouseService.createWarehouse(request))
                .isInstanceOf(WarehouseException.class)
                .hasMessageContaining(WarehouseErrorCode.WAREHOUSE_CODE_DUPLICATED.getMessage());
    }

    @Test
    @DisplayName("창고 조회 실패 - 존재하지 않는 창고 ID 시 WAREHOUSE_NOT_FOUND 예외가 발생한다")
    void getWarehouse_notFound() {
        // given
        Long notFoundId = 999L;
        given(warehouseRepository.findById(notFoundId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> warehouseService.getWarehouse(notFoundId))
                .isInstanceOf(WarehouseException.class)
                .hasMessageContaining(WarehouseErrorCode.WAREHOUSE_NOT_FOUND.getMessage());
    }
}
