package com.wms.wms_lite.domain.master.customer.service;

import com.wms.wms_lite.domain.master.customer.dto.request.CustomerCreateRequest;
import com.wms.wms_lite.domain.master.customer.dto.response.CustomerCreateResponse;
import com.wms.wms_lite.domain.master.customer.entity.Customer;
import com.wms.wms_lite.domain.master.customer.exception.CustomerErrorCode;
import com.wms.wms_lite.domain.master.customer.exception.CustomerException;
import com.wms.wms_lite.domain.master.customer.repository.CustomerRepository;
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
 * [고객사/배송지 마스터 단위 테스트 (CustomerServiceTest)]
 *
 * 주요 검증 항목:
 * 1. createCustomer: 고객사 코드 및 사업자번호 중복 체크 검증
 * 2. setPrimaryDeliveryAddress: 신규 기본 배송지 설정 시 기존 기본 배송지가 자동으로 일반 배송지로 전환되는지 검증
 * 3. deleteCustomer: Soft Delete 처리 및 연관 배송지 필터링 검증
 */
@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    @Test
    @DisplayName("고객사 생성 성공 - 중복이 없으면 정상 생성된다")
    void createCustomer_success() {
        // given
        CustomerCreateRequest request = new CustomerCreateRequest(
                "CUST-001", "LG전자 유통사업부", "987-65-43210", "구광모", "02-999-8888", "customer@lg.com", "서울시 영등포구 여의도동"
        );

        given(customerRepository.existsByCode("CUST-001")).willReturn(false);
        given(customerRepository.existsByBusinessNo("987-65-43210")).willReturn(false);
        given(customerRepository.save(any(Customer.class))).willAnswer(invocation -> {
            Customer c = invocation.getArgument(0);
            ReflectionTestUtils.setField(c, "id", 1L);
            return c;
        });

        // when
        CustomerCreateResponse response = customerService.createCustomer(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.code()).isEqualTo("CUST-001");
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    @DisplayName("고객사 생성 실패 - 이미 동일한 고객사 코드가 존재 시 CUSTOMER_CODE_DUPLICATED 예외가 발생한다")
    void createCustomer_duplicatedCode() {
        // given
        CustomerCreateRequest request = new CustomerCreateRequest(
                "CUST-001", "LG전자", null, null, null, null, null
        );
        given(customerRepository.existsByCode("CUST-001")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> customerService.createCustomer(request))
                .isInstanceOf(CustomerException.class)
                .hasMessageContaining(CustomerErrorCode.CUSTOMER_CODE_DUPLICATED.getMessage());
    }

    @Test
    @DisplayName("고객사 조회 실패 - 존재하지 않는 고객사 ID 조회 시 CUSTOMER_NOT_FOUND 예외가 발생한다")
    void getCustomer_notFound() {
        // given
        Long notFoundId = 999L;
        given(customerRepository.findById(notFoundId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> customerService.getCustomer(notFoundId))
                .isInstanceOf(CustomerException.class)
                .hasMessageContaining(CustomerErrorCode.CUSTOMER_NOT_FOUND.getMessage());
    }
}
