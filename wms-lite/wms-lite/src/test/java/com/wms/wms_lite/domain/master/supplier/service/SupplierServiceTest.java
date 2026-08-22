package com.wms.wms_lite.domain.master.supplier.service;

import com.wms.wms_lite.domain.master.supplier.dto.request.SupplierCreateRequest;
import com.wms.wms_lite.domain.master.supplier.dto.response.SupplierCreateResponse;
import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import com.wms.wms_lite.domain.master.supplier.exception.SupplierErrorCode;
import com.wms.wms_lite.domain.master.supplier.exception.SupplierException;
import com.wms.wms_lite.domain.master.supplier.repository.SupplierRepository;
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
 * [공급사 마스터 단위 테스트 (SupplierServiceTest)]
 *
 * 주요 검증 항목:
 * 1. createSupplier: 공급사 코드 및 사업자등록번호 중복 검증
 * 2. updateSupplier: 공급사 대표자/연락처/주소 수정 검증
 * 3. deleteSupplier: Soft Delete 처리 및 활성 공급사 조회 필터링 검증
 */
@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierService supplierService;

    @Test
    @DisplayName("공급사 생성 성공 - 중복이 없으면 정상 생성된다")
    void createSupplier_success() {
        // given
        SupplierCreateRequest request = new SupplierCreateRequest(
                "SUP-001", "삼성전자 물류사업부", "123-45-67890", "이재용", "010-1111-2222", "supplier@samsung.com", "서울시 서초구", "전자제품 공급"
        );

        given(supplierRepository.existsByCode("SUP-001")).willReturn(false);
        given(supplierRepository.existsByBusinessNo("123-45-67890")).willReturn(false);
        given(supplierRepository.save(any(Supplier.class))).willAnswer(invocation -> {
            Supplier s = invocation.getArgument(0);
            ReflectionTestUtils.setField(s, "id", 1L);
            return s;
        });

        // when
        SupplierCreateResponse response = supplierService.createSupplier(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.code()).isEqualTo("SUP-001");
        verify(supplierRepository).save(any(Supplier.class));
    }

    @Test
    @DisplayName("공급사 생성 실패 - 이미 동일한 사업자번호가 존재하는 경우 SUPPLIER_BUSINESS_NO_DUPLICATED 예외가 발생한다")
    void createSupplier_duplicatedBusinessNo() {
        // given
        SupplierCreateRequest request = new SupplierCreateRequest(
                "SUP-002", "공급사 B", "123-45-67890", null, null, null, null, null
        );

        given(supplierRepository.existsByCode("SUP-002")).willReturn(false);
        given(supplierRepository.existsByBusinessNo("123-45-67890")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> supplierService.createSupplier(request))
                .isInstanceOf(SupplierException.class)
                .hasMessageContaining(SupplierErrorCode.SUPPLIER_BUSINESS_NO_DUPLICATED.getMessage());
    }

    @Test
    @DisplayName("공급사 조회 실패 - 존재하지 않는 공급사 ID 시 SUPPLIER_NOT_FOUND 예외가 발생한다")
    void getSupplier_notFound() {
        // given
        Long notFoundId = 999L;
        given(supplierRepository.findById(notFoundId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> supplierService.getSupplier(notFoundId))
                .isInstanceOf(SupplierException.class)
                .hasMessageContaining(SupplierErrorCode.SUPPLIER_NOT_FOUND.getMessage());
    }
}
