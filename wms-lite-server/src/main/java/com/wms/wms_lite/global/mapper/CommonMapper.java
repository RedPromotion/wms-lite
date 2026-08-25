package com.wms.wms_lite.global.mapper;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommonMapper {

    default String toString(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}
