package com.wms.wms_lite.domain.board.entity;

import com.wms.wms_lite.global.entity.SoftDeleteEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@MappedSuperclass
public abstract class BaseArticle extends SoftDeleteEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private Integer viewCount = 0;

    public void increaseViewCount() {
        this.viewCount++;
    }
}
