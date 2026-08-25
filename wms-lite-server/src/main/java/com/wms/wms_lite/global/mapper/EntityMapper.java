package com.wms.wms_lite.global.mapper;

import java.util.List;

public interface EntityMapper<D, E> {
    D toDto(E entity);

    E toEntity(D dto);

    List<D> toDtoList(List<E> entities);

    List<E> toEntityList(List<D> dtos);
}
