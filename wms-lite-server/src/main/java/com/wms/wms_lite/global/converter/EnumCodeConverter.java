package com.wms.wms_lite.global.converter;

import jakarta.persistence.AttributeConverter;

public abstract class EnumCodeConverter<E extends Enum<E> & EnumCode> implements AttributeConverter<E, String> {

    private final Class<E> enumType;

    protected EnumCodeConverter(Class<E> enumType) {
        this.enumType = enumType;
    }

    @Override
    public String convertToDatabaseColumn(E attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public E convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }

        for (E value : enumType.getEnumConstants()) {
            if (value.getCode().equals(dbData)) {
                return value;
            }
        }

        throw new IllegalArgumentException("Unknown enum code: " + dbData);
    }
}
