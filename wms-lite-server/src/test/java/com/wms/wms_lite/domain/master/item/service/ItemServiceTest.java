package com.wms.wms_lite.domain.master.item.service;

import com.wms.wms_lite.domain.master.item.dto.request.ItemCreateRequest;
import com.wms.wms_lite.domain.master.item.dto.response.ItemCreateResponse;
import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.enums.UnitType;
import com.wms.wms_lite.domain.master.item.exception.ItemErrorCode;
import com.wms.wms_lite.domain.master.item.exception.ItemException;
import com.wms.wms_lite.domain.master.item.repository.ItemCategoryRepository;
import com.wms.wms_lite.domain.master.item.repository.ItemRepository;
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
 * [품목 마스터 단위 테스트 (ItemServiceTest)]
 *
 * 주요 검증 항목:
 * 1. createItem: 품목 코드 중복 등록 방지 및 카테고리/규격 유효성 검증
 * 2. updateItem: 품목 정보 수정 및 상태(ACTIVE/INACTIVE) 변경 검증
 * 3. deleteItem: 품목 Soft Delete(deletedAt 필드 세팅) 처리 및 일반 조회 시 필터링 검증
 */
@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private ItemCategoryRepository itemCategoryRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private ItemService itemService;

    @Test
    @DisplayName("품목 생성 성공 - 중복 코드가 없으면 정상 저장된다")
    void createItem_success() {
        // given
        ItemCreateRequest request = new ItemCreateRequest(
                "ITEM-001", "모니터 27인치", "8801234567890", null, null, UnitType.EA, "27인치 4K", "설명", 10
        );

        given(itemRepository.existsByCode("ITEM-001")).willReturn(false);
        given(itemRepository.existsByBarcode("8801234567890")).willReturn(false);
        given(itemRepository.save(any(Item.class))).willAnswer(invocation -> {
            Item item = invocation.getArgument(0);
            ReflectionTestUtils.setField(item, "id", 1L);
            return item;
        });

        // when
        ItemCreateResponse response = itemService.createItem(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.code()).isEqualTo("ITEM-001");
        verify(itemRepository).save(any(Item.class));
    }

    @Test
    @DisplayName("품목 생성 실패 - 이미 존재 중인 품목 코드 요청 시 ITEM_CODE_DUPLICATED 예외가 발생한다")
    void createItem_duplicatedCode() {
        // given
        ItemCreateRequest request = new ItemCreateRequest(
                "ITEM-001", "모니터", null, null, null, UnitType.EA, null, null, 5
        );
        given(itemRepository.existsByCode("ITEM-001")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> itemService.createItem(request))
                .isInstanceOf(ItemException.class)
                .hasMessageContaining(ItemErrorCode.ITEM_CODE_DUPLICATED.getMessage());
    }

    @Test
    @DisplayName("품목 단건 조회 실패 - 삭제(Soft Delete)된 품목 조회 시 ITEM_NOT_FOUND 예외가 발생한다")
    void getItem_deletedItem_throwsException() {
        // given
        Long itemId = 1L;
        Item deletedItem = new Item();
        deletedItem.markDeleted("testUser");

        given(itemRepository.findById(itemId)).willReturn(Optional.of(deletedItem));

        // when & then
        assertThatThrownBy(() -> itemService.getItem(itemId))
                .isInstanceOf(ItemException.class)
                .hasMessageContaining(ItemErrorCode.ITEM_NOT_FOUND.getMessage());
    }
}
