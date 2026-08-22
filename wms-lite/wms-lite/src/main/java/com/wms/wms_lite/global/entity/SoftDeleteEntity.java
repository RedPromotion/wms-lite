package com.wms.wms_lite.global.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
@SQLRestriction("deleted_at IS NULL")
public abstract class SoftDeleteEntity extends AuditableEntity {

    @Column(length = 100)
    private String deletedBy;

    private LocalDateTime deletedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void markDeleted(String deletedBy) {
        this.deletedBy = deletedBy;
        this.deletedAt = LocalDateTime.now();
    }
}
